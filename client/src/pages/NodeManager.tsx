import { useEffect, useState } from 'react';
import { Server, Plus, Trash2, ShieldAlert, Activity, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllNodes, registerNode, deleteNode, ManagedNode } from '@/api/nodes';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function NodeManager() {
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNode, setNewNode] = useState({ name: '', ip: '', user: '', password: '', os: 'linux' as const });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const data = await getAllNodes();
      setNodes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch monitored nodes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleRegisterNode = async () => {
    try {
      await registerNode(newNode);
      toast({
        title: 'Success',
        description: `Node ${newNode.name} registered successfully`,
      });
      setIsAddDialogOpen(false);
      setNewNode({ name: '', ip: '', user: '', password: '', os: 'linux' });
      fetchNodes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register node',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to remove this node from monitoring?')) return;
    try {
      await deleteNode(id);
      toast({
        title: 'Deleted',
        description: 'Node removed from monitoring',
      });
      fetchNodes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove node',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: ManagedNode['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">Online</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'unauthorized':
        return <Badge variant="destructive">Auth Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Node Management</h1>
          <p className="text-muted-foreground">Manage and monitor remote "Real World" servers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="mr-2 h-4 w-4" /> Add Remote Node
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Node</DialogTitle>
              <DialogDescription>
                Add a remote server to the monitoring inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Node Name</Label>
                <Input
                  id="name"
                  placeholder="Production Web Server"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.100"
                  value={newNode.ip}
                  onChange={(e) => setNewNode({ ...newNode, ip: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user">SSH User</Label>
                <Input
                  id="user"
                  placeholder="root"
                  value={newNode.user}
                  onChange={(e) => setNewNode({ ...newNode, user: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">System SSH Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter SSH password"
                  value={newNode.password}
                  onChange={(e) => setNewNode({ ...newNode, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRegisterNode}>Register Node</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Activity className="h-4 w-4" /> Active Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.filter(n => n.status === 'online').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Globe className="h-4 w-4" /> Total Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" /> Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 animate-pulse">
              {nodes.reduce((acc, node) => acc + (node.findingsCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitored Inventory</CardTitle>
          <CardDescription>Real-time status of your "Real World" managed nodes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodes.length > 0 ? (
                  nodes.map((node) => (
                    <TableRow key={node._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          {node.name}
                        </div>
                      </TableCell>
                      <TableCell>{node.ip}</TableCell>
                      <TableCell>{node.user}</TableCell>
                      <TableCell className="capitalize">{node.os}</TableCell>
                      <TableCell>{getStatusBadge(node.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/nodes/${node._id}/persistence`)}
                          >
                            <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" /> Audit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNode(node._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No remote nodes registered. Click "Add Remote Node" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
