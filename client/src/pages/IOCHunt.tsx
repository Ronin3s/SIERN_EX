import React, { useState } from 'react';
import { Search, Clipboard, Trash2, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
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
                <Button variant="outline" size="sm" className="gap-2">
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
                          <Button variant="ghost" size="sm">
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
    </div>
  );
}