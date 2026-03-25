import { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle, Clock, Server, AlertTriangle, ShieldCheck, Eye, Terminal, Info, Sparkles, Bot, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useParams, useNavigate } from 'react-router-dom';
import { getFindingsByNode, auditNodePersistence, resolveFinding, PersistenceFinding, ManagedNode, getNodeById, analyzeFindingWithAI } from '@/api/nodes';
import { useToast } from '@/hooks/useToast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PersistenceMonitor() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [node, setNode] = useState<ManagedNode | null>(null);
  const [findings, setFindings] = useState<PersistenceFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<PersistenceFinding | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    steps: string[];
    riskScore: number;
    toolsNeeded: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!nodeId) return;
    try {
      setLoading(true);
      const [nodeData, findingsData] = await Promise.all([
        getNodeById(nodeId),
        getFindingsByNode(nodeId),
      ]);
      setNode(nodeData);
      setFindings(findingsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch node data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [nodeId]);

  const handleAudit = async () => {
    if (!nodeId) return;
    try {
      setAuditing(true);
      toast({
        title: 'Audit Started',
        description: 'Scanning remote node for unauthorized persistence...',
      });
      const newFindings = await auditNodePersistence(nodeId);
      setFindings(newFindings);
      toast({
        title: 'Audit Complete',
        description: `Discovered ${newFindings.length} security findings`,
      });
    } catch (error) {
      toast({
        title: 'Audit Failed',
        description: 'Could not complete remote scan',
        variant: 'destructive',
      });
    } finally {
      setAuditing(false);
    }
  };

  const handleAIAnalysis = async (findingId: string) => {
    try {
      setAnalyzing(true);
      const result = await analyzeFindingWithAI(findingId);
      setAiAnalysis(result);
    } catch (error) {
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not connect to the SIERN AI Engine',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolve = async (findingId: string) => {
    try {
      await resolveFinding(findingId);
      toast({
        title: 'Resolved',
        description: 'Finding marked as resolved',
      });
      setFindings(findings.filter(f => f._id !== findingId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve finding',
        variant: 'destructive',
      });
    }
  };

  const getSeverityBadge = (severity: PersistenceFinding['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getTypeIcon = (type: PersistenceFinding['type']) => {
    switch (type) {
      case 'ssh': return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      case 'cron': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'service': return <Server className="h-4 w-4 text-green-500" />;
      case 'user': return <ShieldAlert className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Node Not Found</h2>
        <Button onClick={() => navigate('/nodes')} className="mt-4">Back to Inventory</Button>
      </div>
    );
  }

  const activeFindings = findings.filter(f => f.status === 'active');
  const resolvedFindings = findings.filter(f => f.status === 'resolved');
  const totalFindingsCount = findings.length;
  const progressPercent = totalFindingsCount > 0 
    ? Math.round((resolvedFindings.length / totalFindingsCount) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/nodes')}>
            <ShieldCheck className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Audit: {node.name}</h1>
            <p className="text-muted-foreground">Persistence and backdoor audit for remote target {node.ip}</p>
          </div>
        </div>
        <Button 
          disabled={auditing} 
          onClick={handleAudit}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-semibold"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${auditing ? 'animate-spin' : ''}`} />
          {auditing ? 'Auditing Remote Node...' : 'Trigger Security Audit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mitigation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {activeFindings.length === 0 ? 'Threat Disposed' : `${activeFindings.length} Active / ${resolvedFindings.length} Resolved`}
              </span>
              <span className="text-sm font-bold">{progressPercent}% CLEANED</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>
        <Card className={`${progressPercent === 100 ? 'bg-green-900' : 'bg-slate-900'} text-white border-slate-700 shadow-xl transition-colors duration-500`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-70">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${progressPercent === 100 ? 'text-green-400' : 'text-orange-400'}`}>
              {progressPercent === 100 ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </div>
            <p className="text-xs opacity-50 mt-1">
              {progressPercent === 100 ? 'No unauthorized persistence' : 'Unauthorized persistence detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Security Findings</CardTitle>
                <CardDescription>Detected persistence mechanisms requiring remediation</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">NODE_HASH: {node._id.substring(0, 8)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                   <TableHead>Finding Name</TableHead>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.length > 0 ? (
                  findings.map((finding) => (
                    <TableRow 
                      key={finding._id} 
                      className={`cursor-pointer transition-colors ${
                        finding.status === 'resolved' 
                          ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/20' 
                          : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                      onClick={() => setSelectedFinding(finding)}
                    >
                      <TableCell className="w-[50px]">
                        {finding.status === 'resolved' ? <CheckCircle className="h-4 w-4 text-green-500" /> : getTypeIcon(finding.type)}
                      </TableCell>
                      <TableCell className={`font-medium ${finding.status === 'resolved' ? 'line-through' : ''}`}>
                        {finding.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[300px] truncate underline decoration-dotted underline-offset-4 decoration-muted-foreground/50">
                        {finding.indicator}
                      </TableCell>
                      <TableCell>{finding.status === 'resolved' ? <Badge variant="secondary">Resolved</Badge> : getSeverityBadge(finding.severity)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setAiAnalysis(null);
                              setSelectedFinding(finding);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          {finding.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40"
                              onClick={() => {
                                setAiAnalysis(null);
                                handleResolve(finding._id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="h-12 w-12 text-green-500 opacity-50" />
                        <p className="text-lg font-semibold">No active persistence findings</p>
                        <p className="text-sm">Scan your node to identify potential backdoors.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedFinding} onOpenChange={(open) => {
        if (!open) {
          setSelectedFinding(null);
          setAiAnalysis(null);
        }
      }}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          {selectedFinding && node && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-900">
                    {getTypeIcon(selectedFinding.type)}
                  </div>
                  {getSeverityBadge(selectedFinding.severity)}
                </div>
                <DialogTitle className="text-2xl font-bold">{selectedFinding.name}</DialogTitle>
                <DialogDescription className="text-base">
                  Security finding detected on {node.name} ({node.ip})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Info className="h-4 w-4" /> Description
                  </div>
                  <p className="text-sm leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {selectedFinding.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Terminal className="h-4 w-4" /> Technical Indicator / Location
                  </div>
                  <div className="font-mono text-xs p-3 bg-black text-green-400 rounded-lg overflow-x-auto border border-slate-800">
                    {selectedFinding.indicator}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {!aiAnalysis && !analyzing ? (
                    <Button 
                      className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200"
                      onClick={() => handleAIAnalysis(selectedFinding._id)}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-blue-400 animate-pulse" />
                      Consult SIERN AI Security Assistant
                    </Button>
                  ) : analyzing ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <div className="relative">
                        <Bot className="h-10 w-10 text-blue-500" />
                        <div className="absolute -top-1 -right-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium animate-pulse">SIERN AI is analyzing the threat vectors...</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30">
                        <div className="mt-1 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm">
                          <Bot className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">AI Expert Analysis</span>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-orange-500" />
                              <span className="text-xs font-mono font-bold">RISK: {aiAnalysis?.riskScore}/10</span>
                            </div>
                          </div>
                          <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                            "{aiAnalysis?.analysis}"
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          <Shield className="h-4 w-4 text-green-500" /> AI-Generated Remediation Plan
                        </div>
                        <div className="space-y-2">
                          {aiAnalysis?.steps.map((step, i) => (
                            <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis?.toolsNeeded.map(tool => (
                          <Badge key={tool} variant="outline" className="bg-slate-50 dark:bg-slate-900 px-2 py-1 flex items-center gap-2">
                            <Terminal className="h-3 w-3" /> {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => {
                  setSelectedFinding(null);
                  setAiAnalysis(null);
                }}>Close</Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleResolve(selectedFinding._id);
                    setSelectedFinding(null);
                    setAiAnalysis(null);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Verify & Resolve
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
