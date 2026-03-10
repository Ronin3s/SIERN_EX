import React, { useState } from 'react';
import { Search, Clipboard, Trash2, Play, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { startIOCHunt, getHuntResults } from '@/api/iocHunt';
import { useToast } from '@/hooks/useToast';

interface HuntResult {
  id: string;
  ioc: string;
  matchLocation: string;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export function IOCHunt() {
  const [iocInput, setIocInput] = useState('');
  const [hunting, setHunting] = useState(false);
  const [huntProgress, setHuntProgress] = useState(0);
  const [results, setResults] = useState<HuntResult[]>([]);
  const [searchScope, setSearchScope] = useState('all');
  const [selectedResult, setSelectedResult] = useState<HuntResult | null>(null);
  const { toast } = useToast();

  const handleStartHunt = async () => {
    if (!iocInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter at least one IOC',
        variant: 'destructive',
      });
      return;
    }

    try {
      setHunting(true);
      setHuntProgress(0);

      const progressInterval = setInterval(() => {
        setHuntProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 25;
        });
      }, 400);

      const iocs = iocInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const data = await startIOCHunt({
        iocs,
        scope: searchScope,
      });

      clearInterval(progressInterval);
      setHuntProgress(100);
      setResults(data);

      toast({
        title: 'Hunt Complete',
        description: `Found ${data.length} matches across your infrastructure`,
      });
    } catch (error) {
      console.error('Hunt failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Hunt failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setHunting(false);
      setTimeout(() => setHuntProgress(0), 1000);
    }
  };

  const handleExportResults = () => {
    const headers = ['IOC', 'Match Location', 'First Seen', 'Last Seen', 'Confidence (%)', 'Severity'];
    const rows = results.map((r) => [
      r.ioc,
      r.matchLocation,
      r.firstSeen,
      r.lastSeen,
      r.confidence,
      r.severity,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ioc_hunt_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: `${results.length} IOC results exported to CSV` });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    }
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
          <h1 className="text-3xl font-bold">IOC Hunting Engine</h1>
          <p className="text-muted-foreground mt-1">Search for indicators of compromise across your infrastructure</p>
        </div>
      </motion.div>

      {/* Search Interface */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle>Enter IOCs</CardTitle>
              <CardDescription>One per line (hashes, IPs, domains, URLs, emails)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="MD5/SHA256 hashes&#10;IP addresses (IPv4/IPv6)&#10;Domain names&#10;URLs&#10;Email addresses"
                value={iocInput}
                onChange={(e) => setIocInput(e.target.value)}
                disabled={hunting}
                className="min-h-40 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setIocInput(text);
                      toast({
                        title: 'Success',
                        description: 'Pasted from clipboard',
                      });
                    } catch (error) {
                      console.error('Failed to read clipboard:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to read from clipboard. Please paste manually or grant clipboard permissions.',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Clipboard className="h-4 w-4" />
                  Paste from Clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIocInput('')}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>

              {hunting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hunting...</span>
                    <span>{Math.round(huntProgress)}%</span>
                  </div>
                  <Progress value={huntProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleStartHunt}
                disabled={hunting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
              >
                {hunting ? (
                  <>
                    <AlertCircle className="h-4 w-4 animate-pulse" />
                    Hunting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Hunt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Scope */}
        <div>
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-base">Search Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: 'processes', label: 'Active Processes' },
                { value: 'filesystem', label: 'File System' },
                { value: 'network', label: 'Network Connections' },
                { value: 'all', label: 'All' },
              ].map((scope) => (
                <label key={scope.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value={scope.value}
                    checked={searchScope === scope.value}
                    onChange={(e) => setSearchScope(e.target.value)}
                    disabled={hunting}
                    className="rounded-full"
                  />
                  <span className="text-sm">{scope.label}</span>
                </label>
              ))}
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
                  <CardTitle>Hunt Results</CardTitle>
                  <CardDescription>{results.length} matches found</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExportResults}
                >
                  <CheckCircle className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                      <TableHead>IOC</TableHead>
                      <TableHead>Match Location</TableHead>
                      <TableHead>First Seen</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <motion.tr
                        key={result.id}
                        className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TableCell className="font-mono text-sm">{result.ioc}</TableCell>
                        <TableCell className="text-sm">{result.matchLocation}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{result.firstSeen}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{result.lastSeen}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/20 dark:bg-slate-800/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm">{result.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(result.severity)}>
                            {result.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            Investigate
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* IOC Investigate Panel */}
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
                    <h2 className="text-2xl font-bold">IOC Investigation</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-mono break-all">{selectedResult.ioc}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedResult(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Threat Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Severity</span>
                      <Badge className={getSeverityColor(selectedResult.severity)}>
                        {selectedResult.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-white/20 dark:bg-slate-800/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${selectedResult.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{selectedResult.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Match Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Match Location</p>
                      <p className="font-mono text-sm break-all">{selectedResult.matchLocation}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">First Seen</p>
                        <p className="text-sm font-medium">{selectedResult.firstSeen}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Seen</p>
                        <p className="text-sm font-medium">{selectedResult.lastSeen}</p>
                      </div>
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