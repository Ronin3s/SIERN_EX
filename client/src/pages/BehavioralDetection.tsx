import React, { useEffect, useState } from 'react';
import { AlertCircle, Play, Settings, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnomalies, simulateEvent, runScan } from '@/api/behavioral';
import { useToast } from '@/hooks/useToast';

interface Anomaly {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  process: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'simulated';
}

interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export function BehavioralDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [simulatingRule, setSimulatingRule] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnomalies();
        setAnomalies(data);
      } catch (error) {
        console.error('Failed to fetch anomalies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load anomalies',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSimulate = async (ruleId: string) => {
    try {
      setSimulatingRule(ruleId);
      const newAnomaly = await simulateEvent(ruleId);
      setAnomalies([newAnomaly, ...anomalies]);
      toast({
        title: 'Simulation Complete',
        description: 'Simulated event added to anomaly list',
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      toast({
        title: 'Error',
        description: 'Simulation failed',
        variant: 'destructive',
      });
    } finally {
      setSimulatingRule(null);
    }
  };

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const result = await runScan();
      setAnomalies([...result.anomalies, ...anomalies]);
      toast({
        title: 'Scan Complete',
        description: `Detection scan finished. Found ${result.detected} new anomalies.`,
      });
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: 'Error',
        description: 'Detection scan failed',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      default:
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Behavioral Anomaly Detection</h1>
            <p className="text-muted-foreground mt-1">Rule-based threat detection and analysis</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRunScan}
              disabled={scanning}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Run Detection Scan'}
            </Button>
            <Button
              onClick={() => setShowRules(!showRules)}
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {showRules ? 'Hide Rules' : 'View Rules'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Rules Panel */}
      {showRules && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle>Detection Rules</CardTitle>
              <CardDescription>Manage behavioral detection rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: 'BR-001',
                    name: 'Encoded Command Execution via CLI',
                    description: 'Detects base64 or hex encoded commands executed through command line',
                  },
                  {
                    id: 'BR-002',
                    name: 'Child Process Spawning from Temp Directories',
                    description: 'Monitors for suspicious process creation from temporary directories',
                  },
                  {
                    id: 'BR-004',
                    name: 'Potential Process Injection Signatures',
                    description: 'Identifies patterns consistent with process injection attacks',
                  },
                ].map((rule) => (
                  <motion.div
                    key={rule.id}
                    className="p-4 rounded-lg border border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{rule.id}</Badge>
                          <p className="font-semibold">{rule.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{rule.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSimulate(rule.id)}
                        disabled={simulatingRule === rule.id}
                        className="gap-2 ml-4"
                      >
                        <Play className="h-4 w-4" />
                        Simulate
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Anomalies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>{anomalies.length} anomalies detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                    <TableHead>Rule ID</TableHead>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((anomaly) => (
                    <motion.tr
                      key={anomaly.id}
                      className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell className="font-mono text-sm">{anomaly.ruleId}</TableCell>
                      <TableCell className="font-medium">{anomaly.ruleName}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{anomaly.process}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{anomaly.timestamp}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(anomaly.status)} border`}>
                          {anomaly.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelectedAnomaly(anomaly)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
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

      {/* Anomaly Details Panel */}
      <AnimatePresence>
        {selectedAnomaly && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnomaly(null)}
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
                    <h2 className="text-2xl font-bold">Anomaly Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedAnomaly.ruleId}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedAnomaly(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Severity & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Severity</span>
                      <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                        {selectedAnomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={`${getStatusColor(selectedAnomaly.status)} border`}>
                        {selectedAnomaly.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Rule Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rule ID</p>
                      <p className="font-mono font-medium">{selectedAnomaly.ruleId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rule Name</p>
                      <p className="font-medium">{selectedAnomaly.ruleName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Triggered By Process</p>
                      <p className="font-mono text-sm break-all">{selectedAnomaly.process}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="text-sm">{selectedAnomaly.timestamp}</p>
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