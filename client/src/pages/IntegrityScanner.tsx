import React, { useEffect, useState } from 'react';
import { Play, Pause, Plus, Download, AlertCircle, CheckCircle, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { getScanResults, startScan, getBaseline, createBaseline } from '@/api/scanner';
import { useToast } from '@/hooks/useToast';

interface ScanResult {
  id: string;
  filePath: string;
  changeType: 'MODIFIED' | 'NEW' | 'DELETED';
  currentHash: string;
  previousHash: string;
  lastModified: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export function IntegrityScanner() {
  const [scanPath, setScanPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [includeSubdirs, setIncludeSubdirs] = useState(true);
  const [compareBaseline, setCompareBaseline] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [creatingBaseline, setCreatingBaseline] = useState(false);
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const { toast } = useToast();

  const handleStartScan = async () => {
    if (!scanPath) {
      toast({
        title: 'Error',
        description: 'Please enter a scan path',
        variant: 'destructive',
      });
      return;
    }

    try {
      setScanning(true);
      setProgress(0);

      // Simulate scan progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      const data = await startScan({
        path: scanPath,
        includeSubdirectories: includeSubdirs,
        compareAgainstBaseline: compareBaseline,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResults(data);

      toast({
        title: 'Success',
        description: `Scan completed. Found ${data.length} changes.`,
      });
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: 'Error',
        description: 'Scan failed',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleCreateBaseline = async () => {
    if (!scanPath) {
      toast({
        title: 'Error',
        description: 'Please enter a scan path before creating a baseline',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingBaseline(true);
      const result = await createBaseline({
        path: scanPath,
        includeSubdirectories: includeSubdirs,
      });
      toast({
        title: 'Baseline Created',
        description: result.message || `Created ${result.created ?? 0}, updated ${result.updated ?? 0} entries`,
      });
    } catch (error) {
      console.error('Failed to create baseline:', error);
      toast({
        title: 'Error',
        description: 'Failed to create baseline',
        variant: 'destructive',
      });
    } finally {
      setCreatingBaseline(false);
    }
  };

  const handleLoadBaseline = async () => {
    try {
      setLoadingBaseline(true);
      const data = await getBaseline();
      const count = Array.isArray(data) ? data.length : 0;
      toast({
        title: 'Baseline Loaded',
        description: `Baseline contains ${count} tracked file${count !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Failed to load baseline:', error);
      toast({
        title: 'Error',
        description: 'Failed to load baseline',
        variant: 'destructive',
      });
    } finally {
      setLoadingBaseline(false);
    }
  };

  const handleExportReport = () => {
    const headers = ['File Path', 'Change Type', 'Last Modified', 'Risk Level', 'Current Hash', 'Previous Hash'];
    const rows = results.map((r) => [
      r.filePath,
      r.changeType,
      r.lastModified,
      r.riskLevel,
      r.currentHash,
      r.previousHash,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `integrity_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: `${results.length} file changes exported to CSV` });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'MODIFIED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'NEW':
        return <Plus className="h-4 w-4 text-blue-500" />;
      case 'DELETED':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredResults = {
    all: results,
    modified: results.filter((r) => r.changeType === 'MODIFIED'),
    new: results.filter((r) => r.changeType === 'NEW'),
    deleted: results.filter((r) => r.changeType === 'DELETED'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Host Integrity Scanner</h1>
          <p className="text-muted-foreground mt-1">Monitor file changes and baseline integrity</p>
        </div>
      </motion.div>

      {/* Configuration */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle>Configure Scan</CardTitle>
              <CardDescription>Set up your integrity scan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Scan Path</label>
                <Input
                  placeholder="e.g., /etc, /usr/bin, C:\Windows\System32"
                  value={scanPath}
                  onChange={(e) => setScanPath(e.target.value)}
                  disabled={scanning}
                  className="mt-2 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSubdirs}
                    onChange={(e) => setIncludeSubdirs(e.target.checked)}
                    disabled={scanning}
                    className="rounded"
                  />
                  <span className="text-sm">Include subdirectories</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compareBaseline}
                    onChange={(e) => setCompareBaseline(e.target.checked)}
                    disabled={scanning}
                    className="rounded"
                  />
                  <span className="text-sm">Compare against baseline</span>
                </label>
              </div>

              {scanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scanning...</span>
                    <span>{Math.round(scanProgress)}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleStartScan}
                disabled={scanning}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
              >
                {scanning ? (
                  <>
                    <Pause className="h-4 w-4 animate-pulse" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleCreateBaseline}
                disabled={creatingBaseline || scanning}
              >
                <Plus className="h-4 w-4" />
                {creatingBaseline ? 'Creating...' : 'Create Baseline'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLoadBaseline}
                disabled={loadingBaseline || scanning}
              >
                <Download className="h-4 w-4" />
                {loadingBaseline ? 'Loading...' : 'Load Baseline'}
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-base">Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setScanPath('/etc')}
              >
                /etc
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setScanPath('/usr/bin')}
              >
                /usr/bin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setScanPath('C:\\Windows\\System32')}
              >
                System32
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>File changes detected</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExportReport}
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-900/50">
                  <TabsTrigger value="all">All ({filteredResults.all.length})</TabsTrigger>
                  <TabsTrigger value="modified">Modified ({filteredResults.modified.length})</TabsTrigger>
                  <TabsTrigger value="new">New ({filteredResults.new.length})</TabsTrigger>
                  <TabsTrigger value="deleted">Deleted ({filteredResults.deleted.length})</TabsTrigger>
                </TabsList>

                {Object.entries(filteredResults).map(([key, items]) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                            <TableHead>File Path</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Last Modified</TableHead>
                            <TableHead>Risk</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((result) => (
                            <motion.tr
                              key={result.id}
                              className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <TableCell className="font-mono text-sm">{result.filePath}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getChangeTypeIcon(result.changeType)}
                                  <span>{result.changeType}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{result.lastModified}</TableCell>
                              <TableCell>
                                <Badge className={getRiskColor(result.riskLevel)}>
                                  {result.riskLevel.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedResult(result)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* File Details Panel */}
      <AnimatePresence>
        {selectedResult && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
            />
            <motion.div
              className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white dark:bg-slate-950 border-l border-white/20 dark:border-slate-700/50 shadow-2xl z-50 overflow-y-auto"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">File Details</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
                      {selectedResult.filePath.split('/').pop() || selectedResult.filePath}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedResult(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Change Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Change Type</span>
                      <div className="flex items-center gap-2">
                        {getChangeTypeIcon(selectedResult.changeType)}
                        <span className="font-medium">{selectedResult.changeType}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <Badge className={getRiskColor(selectedResult.riskLevel)}>
                        {selectedResult.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Modified</span>
                      <span className="text-sm">{selectedResult.lastModified}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">File Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Path</p>
                      <p className="font-mono text-sm break-all">{selectedResult.filePath}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Hash</p>
                      <p className="font-mono text-xs break-all text-blue-600 dark:text-blue-400">
                        {selectedResult.currentHash || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Hash</p>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        {selectedResult.previousHash || '—'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}