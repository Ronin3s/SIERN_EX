import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Download, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { getProcesses, killProcess } from '@/api/processes';
import { useToast } from '@/hooks/useToast';
import { ProcessDetailsPanel } from '@/components/ProcessDetailsPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Process {
  id: string;
  name: string;
  pid: number;
  user: string;
  cpu: number;
  memory: number;
  path: string;
  riskScore: number;
}

export function ProcessMonitor() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [processToKill, setProcessToKill] = useState<Process | null>(null);
  const { toast } = useToast();

  const fetchProcesses = useCallback(async () => {
    try {
      const data = await getProcesses();
      setProcesses(data);
      setFilteredProcesses(data);
    } catch (error) {
      console.error('Failed to fetch processes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load processes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProcesses();
    if (autoRefresh) {
      const interval = setInterval(fetchProcesses, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchProcesses]);

  useEffect(() => {
    const filtered = processes.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.pid.toString().includes(searchLower)
      );
    });
    setFilteredProcesses(filtered);
  }, [searchTerm, processes]);

  const handleKillProcess = async () => {
    if (!processToKill) return;

    try {
      await killProcess(processToKill.id);
      setProcesses(processes.filter((p) => p.id !== processToKill.id));
      setProcessToKill(null);
      toast({
        title: 'Success',
        description: `Process ${processToKill.name} terminated successfully`,
      });
    } catch (error) {
      console.error('Failed to kill process:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate process',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'PID', 'User', 'CPU (%)', 'Memory (%)', 'Path', 'Risk Score'];
    const rows = filteredProcesses.map((p) => [
      p.name,
      p.pid,
      p.user,
      p.cpu.toFixed(1),
      p.memory.toFixed(1),
      p.path,
      p.riskScore,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: `${filteredProcesses.length} processes exported to CSV` });
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (score <= 70) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 70) return 'Medium';
    return 'High';
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
          <h1 className="text-3xl font-bold">Process Monitor</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of running processes</p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex gap-4 flex-wrap items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchProcesses()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? 'bg-blue-500/20 border-blue-500/30' : ''}
        >
          {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExportCSV}
          disabled={filteredProcesses.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Processes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Running Processes</CardTitle>
            <CardDescription>{filteredProcesses.length} processes found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                    <TableHead>Process Name</TableHead>
                    <TableHead>PID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>CPU %</TableHead>
                    <TableHead>Memory %</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => (
                    <motion.tr
                      key={process.id}
                      className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell className="font-medium">{process.name}</TableCell>
                      <TableCell className="text-muted-foreground">{process.pid}</TableCell>
                      <TableCell className="text-muted-foreground">{process.user}</TableCell>
                      <TableCell>{process.cpu.toFixed(1)}%</TableCell>
                      <TableCell>{process.memory.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge className={`${getRiskColor(process.riskScore)}`}>
                          {getRiskLabel(process.riskScore)} ({process.riskScore})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProcess(process)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProcessToKill(process)}
                            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Process Details Panel */}
      {selectedProcess && (
        <ProcessDetailsPanel
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
          onKill={() => {
            setProcessToKill(selectedProcess);
            setSelectedProcess(null);
          }}
        />
      )}

      {/* Kill Confirmation Dialog */}
      <AlertDialog open={!!processToKill} onOpenChange={(open) => !open && setProcessToKill(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-950 border-white/20 dark:border-slate-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Process?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate <span className="font-semibold">{processToKill?.name}</span> (PID: {processToKill?.pid})?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleKillProcess}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Terminate
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}