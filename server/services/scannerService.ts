import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import FileBaseline, { IFileBaseline } from '../models/FileBaseline';
import * as alertService from './alertService';
import * as ResponseService from './responseService';

export interface ScanConfig {
  path: string;
  includeSubdirectories: boolean;
  compareAgainstBaseline: boolean;
}

export interface FileChange {
  id: string;
  filePath: string;
  changeType: 'NEW' | 'MODIFIED' | 'DELETED' | 'UNCHANGED';
  currentHash: string;
  previousHash: string;
  lastModified: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  size?: number;
}

/**
 * Calculate SHA256 hash of a file
 */
async function calculateFileHash(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get file stats including size, modified time, permissions
 */
async function getFileStats(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      lastModified: stats.mtime,
      permissions: stats.mode.toString(8),
      isDirectory: stats.isDirectory(),
    };
  } catch (error) {
    console.error(`Error getting stats for ${filePath}:`, error);
    throw error;
  }
}

/**
 * Scan directory recursively
 */
async function scanDirectory(
  dirPath: string,
  includeSubdirectories: boolean,
  results: Map<string, { hash: string; stats: Awaited<ReturnType<typeof getFileStats>> }>
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (includeSubdirectories) {
          await scanDirectory(fullPath, includeSubdirectories, results);
        }
      } else if (entry.isFile()) {
        try {
          const stats = await getFileStats(fullPath);
          const hash = await calculateFileHash(fullPath);
          results.set(fullPath, { hash, stats });
        } catch (error) {
          console.warn(`Skipping file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Calculate risk level based on change type and file location
 */
function calculateRiskLevel(changeType: string, filePath: string): 'critical' | 'high' | 'medium' | 'low' {
  // Critical system paths
  const criticalPaths = ['/etc/passwd', '/etc/shadow', '/etc/sudoers', 'C:\\Windows\\System32'];
  const highPaths = ['/etc/', '/usr/bin/', '/usr/sbin/', 'C:\\Windows'];

  const lowerPath = filePath.toLowerCase();

  if (changeType === 'NEW') {
    // New files in critical locations are high risk
    if (criticalPaths.some(cp => lowerPath.includes(cp.toLowerCase()))) {
      return 'critical';
    }
    if (highPaths.some(hp => lowerPath.includes(hp.toLowerCase()))) {
      return 'high';
    }
    return 'medium';
  }

  if (changeType === 'MODIFIED') {
    // Modified critical files are critical risk
    if (criticalPaths.some(cp => lowerPath.includes(cp.toLowerCase()))) {
      return 'critical';
    }
    if (highPaths.some(hp => lowerPath.includes(hp.toLowerCase()))) {
      return 'high';
    }
    return 'medium';
  }

  if (changeType === 'DELETED') {
    // Deleted critical files are critical risk
    if (criticalPaths.some(cp => lowerPath.includes(cp.toLowerCase()))) {
      return 'critical';
    }
    return 'medium';
  }

  return 'low';
}

/**
 * Start a file integrity scan
 */
export async function startScan(config: ScanConfig): Promise<FileChange[]> {
  try {
    console.log(`Starting file integrity scan on: ${config.path}`);
    console.log(`Include subdirectories: ${config.includeSubdirectories}`);
    console.log(`Compare against baseline: ${config.compareAgainstBaseline}`);

    // Check if path exists
    try {
      await fs.access(config.path);
    } catch (error) {
      throw new Error(`Path does not exist or is not accessible: ${config.path}`);
    }

    const results = new Map<string, { hash: string; stats: Awaited<ReturnType<typeof getFileStats>> }>();

    // Check if it's a directory or file
    const pathStats = await getFileStats(config.path);

    if (pathStats.isDirectory) {
      await scanDirectory(config.path, config.includeSubdirectories, results);
    } else {
      // Single file scan
      const hash = await calculateFileHash(config.path);
      results.set(config.path, { hash, stats: pathStats });
    }

    console.log(`Scanned ${results.size} files`);

    const changes: FileChange[] = [];

    if (config.compareAgainstBaseline) {
      // Compare against baseline
      const baselineFiles = await FileBaseline.find({});
      const baselineMap = new Map<string, IFileBaseline>();

      baselineFiles.forEach(bf => {
        baselineMap.set(bf.filePath, bf);
      });

      // Check for new and modified files
      for (const [filePath, { hash, stats }] of results.entries()) {
        const baseline = baselineMap.get(filePath);

        if (!baseline) {
          // New file
          const change: FileChange = {
            id: crypto.randomUUID(),
            filePath,
            changeType: 'NEW',
            currentHash: hash,
            previousHash: '',
            lastModified: stats.lastModified.toISOString(),
            riskLevel: calculateRiskLevel('NEW', filePath),
            size: stats.size,
          };
          changes.push(change);

          // Create alert for new file
          if (change.riskLevel === 'critical' || change.riskLevel === 'high') {
            await alertService.createAlert({
              title: 'New File Detected',
              severity: change.riskLevel === 'critical' ? 'critical' : 'high',
              description: `New file detected: ${filePath}`,
              source: 'file-scanner',
              metadata: { filePath, hash, changeType: 'NEW' },
            });
          }
        } else if (baseline.hash !== hash) {
          // Modified file
          const change: FileChange = {
            id: crypto.randomUUID(),
            filePath,
            changeType: 'MODIFIED',
            currentHash: hash,
            previousHash: baseline.hash,
            lastModified: stats.lastModified.toISOString(),
            riskLevel: calculateRiskLevel('MODIFIED', filePath),
            size: stats.size,
          };
          changes.push(change);

          // Create alert for modified file
          if (change.riskLevel === 'critical' || change.riskLevel === 'high') {
            await alertService.createAlert({
              title: 'File Modified',
              severity: change.riskLevel === 'critical' ? 'critical' : 'high',
              description: `File modified: ${filePath}`,
              source: 'file-scanner',
              metadata: { filePath, hash, previousHash: baseline.hash, changeType: 'MODIFIED' },
            });
          }
        }

        // Remove from baseline map (for deleted file detection)
        baselineMap.delete(filePath);
      }

      // Remaining files in baseline are deleted
      for (const [filePath, baseline] of baselineMap.entries()) {
        const change: FileChange = {
          id: crypto.randomUUID(),
          filePath,
          changeType: 'DELETED',
          currentHash: '',
          previousHash: baseline.hash,
          lastModified: baseline.lastModified.toISOString(),
          riskLevel: calculateRiskLevel('DELETED', filePath),
        };
        changes.push(change);

        // Create alert for deleted file
        if (change.riskLevel === 'critical' || change.riskLevel === 'high') {
          await alertService.createAlert({
            title: 'File Deleted',
            severity: change.riskLevel === 'critical' ? 'critical' : 'medium',
            description: `File deleted: ${filePath}`,
            source: 'file-scanner',
            metadata: { filePath, previousHash: baseline.hash, changeType: 'DELETED' },
          });
        }
      }
    } else {
      // No baseline comparison, just return current state
      for (const [filePath, { hash, stats }] of results.entries()) {
        changes.push({
          id: crypto.randomUUID(),
          filePath,
          changeType: 'UNCHANGED',
          currentHash: hash,
          previousHash: '',
          lastModified: stats.lastModified.toISOString(),
          riskLevel: 'low',
          size: stats.size,
        });
      }
    }

    console.log(`Scan complete. Found ${changes.length} changes`);

    // Log the scan completion to Response Center
    await ResponseService.createAction({
      type: 'audit',
      target: config.path,
      user: 'Integrity Scanner',
      description: `File integrity scan completed for ${config.path}. ${changes.length} changes detected.`,
      metadata: { path: config.path, changesCount: changes.length }
    });

    return changes;
  } catch (error) {
    console.error('Error during scan:', error);
    throw new Error(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get current baseline
 */
export async function getBaseline(): Promise<IFileBaseline[]> {
  try {
    console.log('Fetching file baseline');
    const baseline = await FileBaseline.find({}).sort({ filePath: 1 });
    console.log(`Retrieved ${baseline.length} baseline entries`);
    return baseline;
  } catch (error) {
    console.error('Error fetching baseline:', error);
    throw new Error(`Failed to fetch baseline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create or update baseline from scan results
 */
export async function createBaseline(scanPath: string, includeSubdirectories: boolean): Promise<{ created: number; updated: number }> {
  try {
    console.log(`Creating baseline for: ${scanPath}`);

    const results = new Map<string, { hash: string; stats: Awaited<ReturnType<typeof getFileStats>> }>();

    // Check if path exists
    try {
      await fs.access(scanPath);
    } catch (error) {
      throw new Error(`Path does not exist or is not accessible: ${scanPath}`);
    }

    const pathStats = await getFileStats(scanPath);

    if (pathStats.isDirectory) {
      await scanDirectory(scanPath, includeSubdirectories, results);
    } else {
      const hash = await calculateFileHash(scanPath);
      results.set(scanPath, { hash, stats: pathStats });
    }

    let created = 0;
    let updated = 0;

    for (const [filePath, { hash, stats }] of results.entries()) {
      const existing = await FileBaseline.findOne({ filePath });

      if (existing) {
        // Update existing baseline
        existing.hash = hash;
        existing.size = stats.size;
        existing.lastModified = stats.lastModified;
        existing.permissions = stats.permissions;
        existing.lastChecked = new Date();
        await existing.save();
        updated++;
      } else {
        // Create new baseline entry
        await FileBaseline.create({
          filePath,
          hash,
          size: stats.size,
          lastModified: stats.lastModified,
          permissions: stats.permissions,
          baselineCreatedAt: new Date(),
        });
        created++;
      }
    }

    console.log(`Baseline created/updated: ${created} new, ${updated} updated`);

    // Log the baseline creation to Response Center
    await ResponseService.createAction({
      type: 'audit',
      target: scanPath,
      user: 'Integrity Scanner',
      description: `New security baseline created for ${scanPath} (${created + updated} files).`,
      metadata: { scanPath, created, updated }
    });

    return { created, updated };
  } catch (error) {
    console.error('Error creating baseline:', error);
    throw new Error(`Failed to create baseline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
