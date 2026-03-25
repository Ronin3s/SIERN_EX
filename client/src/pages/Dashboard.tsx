import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, Activity, Clock, Shield, ShieldCheck, AlertTriangle, Server, Search,
  PieChart as PieChartIcon, BarChart3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getDashboardStats, getRecentAlerts } from '@/api/dashboard';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  activeProcesses: number;
  alertsLast24h: number;
  lastScanTime: string;
  systemStatus: 'normal' | 'warning' | 'critical';
  managedNodesCount: number;
  totalFindings: number;
  findingsBySeverity: Record<string, number>;
  findingsByStatus: Record<string, number>;
}

interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  description: string;
  source: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, alertsData] = await Promise.all([
          getDashboardStats(),
          getRecentAlerts(),
        ]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Persistence Auditor':
        return <Server className="h-4 w-4 text-cyan-500" />;
      case 'Behavioral Engine':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'Integrity Scanner':
        return <Search className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const severityData = stats ? [
    { name: 'Critical', value: stats.findingsBySeverity?.critical || 0, color: '#ef4444' },
    { name: 'High', value: stats.findingsBySeverity?.high || 0, color: '#f97316' },
    { name: 'Medium', value: stats.findingsBySeverity?.medium || 0, color: '#eab308' },
    { name: 'Low', value: stats.findingsBySeverity?.low || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  const statusData = stats ? [
    { name: 'Active', count: stats.findingsByStatus?.active || 0, fill: '#ef4444' },
    { name: 'Resolved', count: stats.findingsByStatus?.resolved || 0, fill: '#22c55e' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Security Operations Center
            </h1>
            <p className="text-muted-foreground mt-2">Real-time threat monitoring and response</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/behavioral')}>View Alerts</Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={() => navigate('/scanner')}
            >
              Start Scan
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {/* Active Processes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Active Processes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activeProcesses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently running</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts Last 24h */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Alerts (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.alertsLast24h || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Detected threats</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Scan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Last Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{stats?.lastScanTime || 'Never'}</div>
              <p className="text-xs text-muted-foreground mt-1">Integrity check</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Managed Nodes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-transform hover:scale-[1.02] cursor-pointer" onClick={() => navigate('/nodes')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                Managed Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.managedNodesCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Servers in SOC inventory</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Persistence Findings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-transform hover:scale-[1.02] cursor-pointer" onClick={() => navigate('/nodes')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Persistence Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalFindings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total backdoor indicators</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusColor(stats?.systemStatus || 'normal')} border`}>
                {stats?.systemStatus?.toUpperCase() || 'NORMAL'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Core monitoring status</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Intelligence Section (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-500" />
                  Threat Severity
                </CardTitle>
                <CardDescription>Distribution of active findings</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="40%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 opacity-20 mb-2" />
                  <p>No active threats detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Resolution Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-500" />
                  Resolution Progress
                </CardTitle>
                <CardDescription>Active vs Remediated threats</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Security Activity</CardTitle>
            <CardDescription>Consolidated events from all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} border-opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group hover:pl-6`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 transition-transform group-hover:scale-125 duration-300">
                        {getSourceIcon(alert.source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
                          <span className="text-[10px] font-mono opacity-60 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            {alert.source}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded">
                            <Clock className="h-3 w-3" /> {alert.timestamp}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No alerts in the last 24 hours</p>
                  <p className="text-xs text-slate-400 mt-1">Infrastructure appears quiet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}