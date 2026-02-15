import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import * as processService from './processService';
import * as alertService from './alertService';
/**
 * Detect IOC type based on pattern
 */
function detectIOCType(ioc) {
    // MD5: 32 hex chars
    if (/^[a-fA-F0-9]{32}$/.test(ioc)) {
        return 'hash';
    }
    // SHA1: 40 hex chars
    if (/^[a-fA-F0-9]{40}$/.test(ioc)) {
        return 'hash';
    }
    // SHA256: 64 hex chars
    if (/^[a-fA-F0-9]{64}$/.test(ioc)) {
        return 'hash';
    }
    // IP address (IPv4)
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ioc)) {
        return 'ip';
    }
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ioc)) {
        return 'email';
    }
    // URL
    if (/^https?:\/\/.+/.test(ioc)) {
        return 'url';
    }
    // Domain
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/.test(ioc)) {
        return 'domain';
    }
    return 'unknown';
}
/**
 * Calculate file hash (MD5, SHA1, SHA256)
 */
async function calculateFileHashes(filePath) {
    try {
        const fileBuffer = await fs.readFile(filePath);
        const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
        const sha1Hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');
        const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        return {
            md5: md5Hash,
            sha1: sha1Hash,
            sha256: sha256Hash,
        };
    }
    catch (error) {
        console.error(`Error hashing file ${filePath}:`, error);
        throw error;
    }
}
/**
 * Search for hash IOCs in filesystem
 */
async function searchFilesystemForHashes(hashes, searchPath, matches) {
    try {
        const entries = await fs.readdir(searchPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(searchPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively search subdirectories (with depth limit to avoid infinite loops)
                const depth = fullPath.split(path.sep).length;
                if (depth < 10) {
                    // Limit recursion depth
                    try {
                        await searchFilesystemForHashes(hashes, fullPath, matches);
                    }
                    catch (error) {
                        console.warn(`Skipping directory ${fullPath}:`, error);
                    }
                }
            }
            else if (entry.isFile()) {
                try {
                    const fileHashes = await calculateFileHashes(fullPath);
                    for (const hash of hashes) {
                        const hashLower = hash.toLowerCase();
                        if (fileHashes.md5 === hashLower ||
                            fileHashes.sha1 === hashLower ||
                            fileHashes.sha256 === hashLower) {
                            const now = new Date().toISOString();
                            matches.push({
                                id: crypto.randomUUID(),
                                ioc: hash,
                                iocType: 'hash',
                                matchLocation: `File: ${fullPath}`,
                                firstSeen: now,
                                lastSeen: now,
                                confidence: 95,
                                severity: 'critical',
                                metadata: {
                                    filePath: fullPath,
                                    md5: fileHashes.md5,
                                    sha1: fileHashes.sha1,
                                    sha256: fileHashes.sha256,
                                },
                            });
                            // Create alert for hash match
                            await alertService.createAlert({
                                title: 'IOC Hash Match Found',
                                severity: 'critical',
                                description: `Malicious file hash detected: ${fullPath}`,
                                source: 'ioc-hunt',
                                metadata: {
                                    ioc: hash,
                                    filePath: fullPath,
                                    hashes: fileHashes,
                                },
                            });
                        }
                    }
                }
                catch (error) {
                    // Skip files we can't read
                    console.warn(`Skipping file ${fullPath}:`, error);
                }
            }
        }
    }
    catch (error) {
        console.error(`Error searching filesystem ${searchPath}:`, error);
    }
}
/**
 * Search for IOCs in running processes
 */
async function searchProcesses(iocs, iocTypes) {
    const matches = [];
    try {
        const processes = await processService.getAllProcesses();
        for (const proc of processes) {
            // Check process name, path, and command line against IOCs
            const searchFields = [
                proc.name.toLowerCase(),
                proc.path.toLowerCase(),
                proc.cmd?.toLowerCase() || '',
            ].join(' ');
            for (const ioc of iocs) {
                const iocLower = ioc.toLowerCase();
                const iocType = iocTypes.get(ioc);
                // Skip hash IOCs for process search (hashes are for files)
                if (iocType === 'hash') {
                    continue;
                }
                if (searchFields.includes(iocLower)) {
                    const now = new Date().toISOString();
                    const match = {
                        id: crypto.randomUUID(),
                        ioc,
                        iocType: iocType || 'domain',
                        matchLocation: `Process: ${proc.name} (PID: ${proc.pid})`,
                        firstSeen: now,
                        lastSeen: now,
                        confidence: 85,
                        severity: proc.riskScore > 50 ? 'critical' : 'high',
                        metadata: {
                            processName: proc.name,
                            pid: proc.pid,
                            path: proc.path,
                            riskScore: proc.riskScore,
                        },
                    };
                    matches.push(match);
                    // Create alert for process match
                    await alertService.createAlert({
                        title: 'IOC Match in Process',
                        severity: match.severity,
                        description: `IOC detected in process: ${proc.name} (PID: ${proc.pid})`,
                        source: 'ioc-hunt',
                        metadata: match.metadata,
                    });
                }
            }
        }
    }
    catch (error) {
        console.error('Error searching processes:', error);
    }
    return matches;
}
/**
 * Start IOC hunt
 */
export async function startIOCHunt(config) {
    try {
        console.log(`Starting IOC hunt with ${config.iocs.length} indicators`);
        console.log(`Scope: ${config.scope}`);
        if (config.iocs.length === 0) {
            throw new Error('No IOCs provided for hunting');
        }
        const matches = [];
        // Classify IOCs by type
        const iocTypes = new Map();
        const hashIOCs = [];
        for (const ioc of config.iocs) {
            const type = detectIOCType(ioc);
            iocTypes.set(ioc, type);
            if (type === 'hash') {
                hashIOCs.push(ioc);
            }
        }
        console.log(`IOC types: ${Array.from(new Set(iocTypes.values())).join(', ')}`);
        // Search processes
        if (config.scope === 'processes' || config.scope === 'both') {
            console.log('Searching running processes...');
            const processMatches = await searchProcesses(config.iocs, iocTypes);
            matches.push(...processMatches);
            console.log(`Found ${processMatches.length} matches in processes`);
        }
        // Search filesystem
        if (config.scope === 'filesystem' || config.scope === 'both') {
            if (hashIOCs.length > 0) {
                console.log('Searching filesystem for hash IOCs...');
                const searchPath = config.searchPath || '/tmp';
                // Verify search path exists
                try {
                    await fs.access(searchPath);
                }
                catch (error) {
                    throw new Error(`Search path does not exist: ${searchPath}`);
                }
                await searchFilesystemForHashes(hashIOCs, searchPath, matches);
                console.log(`Filesystem search complete`);
            }
        }
        console.log(`IOC hunt complete. Found ${matches.length} total matches`);
        return matches;
    }
    catch (error) {
        console.error('Error during IOC hunt:', error);
        throw new Error(`IOC hunt failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Calculate confidence score based on match context
 */
export function calculateConfidence(matchType, context) {
    let confidence = 50; // Base confidence
    // Hash matches are high confidence
    if (matchType === 'hash') {
        confidence = 95;
    }
    // Exact IP matches are high confidence
    if (matchType === 'ip') {
        confidence = 90;
    }
    // Domain matches are medium-high confidence
    if (matchType === 'domain') {
        confidence = 85;
    }
    // URL matches depend on context
    if (matchType === 'url') {
        confidence = 80;
    }
    // Email matches are lower confidence (could be legitimate)
    if (matchType === 'email') {
        confidence = 70;
    }
    return confidence;
}
//# sourceMappingURL=iocHuntService.js.map