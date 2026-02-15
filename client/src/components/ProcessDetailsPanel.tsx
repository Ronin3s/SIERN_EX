import React from 'react';
import { X, Trash2 } from 'lucide-react';
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
  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (score <= 70) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

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
            <div>
              <h2 className="text-2xl font-bold">{process.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">PID: {process.pid}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

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

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}