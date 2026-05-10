import React, { useEffect, useState } from 'react';
import { Shield, Undo2, Eye, Clock, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { getContainmentActions, getActionHistory, undoAction } from '@/api/response';
import { useToast } from '@/hooks/useToast';

interface ContainmentAction {
  id: string;
  type: 'kill' | 'isolate' | 'quarantine';
  target: string;
  timestamp: string;
  status: 'active' | 'resolved';
  user: string;
}

interface ActionHistoryItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  result: 'success' | 'failed';
}

export function ResponseCenter() {
  const [containments, setContainments] = useState<ContainmentAction[]>([]);
  const [history, setHistory] = useState<ActionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContainment, setSelectedContainment] = useState<ContainmentAction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [containmentData, historyData] = await Promise.all([
          getContainmentActions(),
          getActionHistory(),
        ]);
        setContainments(containmentData);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch response data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load response data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);


  const handleUndo = async (actionId: string) => {
    try {
      await undoAction(actionId);
      setContainments(containments.filter((c) => c.id !== actionId));
      toast({
        title: 'Success',
        description: 'Action reversed successfully',
      });
    } catch (error) {
      console.error('Failed to undo action:', error);
      toast({
        title: 'Error',
        description: 'Failed to reverse action',
        variant: 'destructive',
      });
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'kill':
      case 'block':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'isolate':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'quarantine':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'resolve':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'audit':
      case 'hunt':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      case 'resolved':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
    }
  };

  const getResultColor = (result: string) => {
    return result === 'success'
      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
      : 'bg-red-500/20 text-red-700 dark:text-red-400';
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
        <div>
          <h1 className="text-3xl font-bold">Response Center</h1>
          <p className="text-muted-foreground mt-1">Manage containment actions and audit trail</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-900/50">
                <TabsTrigger value="active">Active Containments ({containments.length})</TabsTrigger>
                <TabsTrigger value="history">Action History ({history.length})</TabsTrigger>
              </TabsList>

              {/* Active Containments */}
              <TabsContent value="active" className="mt-4">
                {containments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                          <TableHead>Target</TableHead>
                          <TableHead>Action Type</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {containments.map((action) => (
                          <motion.tr
                            key={action.id}
                            className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TableCell className="font-medium">{action.target}</TableCell>
                            <TableCell>
                              <Badge className={getActionTypeColor(action.type)}>
                                {action.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{action.timestamp}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(action.status)} border`}>
                                {action.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{action.user}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => setSelectedContainment(action)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUndo(action.id)}
                                  className="gap-1 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                >
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active containments</p>
                  </div>
                )}
              </TabsContent>

              {/* Action History */}
              <TabsContent value="history" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 dark:border-slate-700/50 hover:bg-transparent">
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((item) => (
                        <motion.tr
                          key={item.id}
                          className="border-white/10 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell className="font-medium">{item.action}</TableCell>
                          <TableCell className="text-sm">{item.description}</TableCell>
                          <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {item.timestamp}
                          </TableCell>
                          <TableCell className="text-sm">{item.user}</TableCell>
                          <TableCell>
                            <Badge className={getResultColor(item.result)}>
                              {item.result.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Containment Details Panel */}
      <AnimatePresence>
        {selectedContainment && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContainment(null)}
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
                    <h2 className="text-2xl font-bold">Containment Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedContainment.target}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedContainment(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Action Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge className={getActionTypeColor(selectedContainment.type)}>
                        {selectedContainment.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={`${getStatusColor(selectedContainment.status)} border`}>
                        {selectedContainment.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Action Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="font-mono text-sm break-all">{selectedContainment.target}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Executed By</p>
                      <p className="font-medium">{selectedContainment.user}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="text-sm">{selectedContainment.timestamp}</p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  className="w-full gap-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
                  onClick={() => {
                    handleUndo(selectedContainment.id);
                    setSelectedContainment(null);
                  }}
                >
                  <Undo2 className="h-4 w-4" />
                  Reverse This Action
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}