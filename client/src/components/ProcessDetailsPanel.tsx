import React, { useState } from 'react';
import { X, Trash2, ShieldAlert, Terminal, ArrowLeft, ClipboardList, Activity, Globe, FileSearch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ProcessDetailsPanelProps {
  process: Process;
  onClose: () => void;
  onKill: () => void;
}

export function ProcessDetailsPanel({ process, onClose, onKill }: ProcessDetailsPanelProps) {
  const [view, setView] = useState<'details' | 'investigate'>('details');

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (score <= 70) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

  const investigationSteps = [
    {
      title: 'Path Verification',
      desc: 'Check if the executable is in a suspicious directory.',
      command: `ls -la ${process.path}`,
      icon: <FileSearch className="h-4 w-4" />
    },
    {
      title: 'Network Activity',
      desc: 'Identify open sockets or remote connections.',
      command: `ss -tpn | grep ${process.pid}`,
      icon: <Globe className="h-4 w-4" />
    },
    {
      title: 'Environment Check',
      desc: 'Inspect environment variables for injected strings.',
      command: `cat /proc/${process.pid}/environ | tr "\\0" "\\n"`,
      icon: <Terminal className="h-4 w-4" />
    },
    {
      title: 'File Handles',
      desc: 'List all files currently held open by this process.',
      command: `lsof -p ${process.pid}`,
      icon: <ClipboardList className="h-4 w-4" />
    },
    {
      title: 'Resource Impact',
      desc: 'Monitor real-time resource spikes.',
      command: `top -p ${process.pid}`,
      icon: <Activity className="h-4 w-4" />
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {view === 'investigate' && (
                <Button variant="ghost" size="icon" onClick={() => setView('details')} className="-ml-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold">{view === 'details' ? process.name : 'Investigation'}</h2>
                <p className="text-sm text-muted-foreground mt-1">PID: {process.pid}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Risk Score */}
                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{process.riskScore}</span>
                      <Badge className={getRiskColor(process.riskScore)}>
                        {process.riskScore <= 30 ? 'Low' : process.riskScore <= 70 ? 'Medium' : 'High'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Details */}
                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Process Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">User</p>
                      <p className="font-medium">{process.user}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Path</p>
                      <p className="font-mono text-sm break-all">{process.path}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU Usage</p>
                        <p className="font-medium">{process.cpu.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memory Usage</p>
                        <p className="font-medium">{process.memory.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2" onClick={() => setView('investigate')}>
                    <ShieldAlert className="h-4 w-4" />
                    Investigate
                  </Button>
                  <Button
                    onClick={onKill}
                    className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Terminate Process
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="investigate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Follow these forensic steps to verify the process legitimacy on the host.
                </p>
                {investigationSteps.map((step, index) => (
                  <Card key={index} className="overflow-hidden border-white/10 dark:border-slate-700/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {step.icon}
                        </div>
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                      <div className="relative group">
                        <code className="block p-2 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-mono break-all text-blue-600 dark:text-blue-400 pr-8">
                          {step.command}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            navigator.clipboard.writeText(step.command);
                          }}
                        >
                          <ClipboardList className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}