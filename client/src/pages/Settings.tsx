import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';

export function Settings() {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('5');
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [rowDensity, setRowDensity] = useState('normal');
  const [ruleSensitivity, setRuleSensitivity] = useState('medium');
  const [exportFormat, setExportFormat] = useState('csv');
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Success',
      description: 'Settings saved successfully',
    });
  };

  const handleReset = () => {
    setAutoRefreshInterval('5');
    setAlertNotifications(true);
    setEmailNotifications(false);
    setSoundNotifications(true);
    setRowDensity('normal');
    setRuleSensitivity('medium');
    setExportFormat('csv');
    toast({
      title: 'Reset',
      description: 'Settings reset to defaults',
    });
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your SIREN experience</p>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-900/50">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general application behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="refresh">Auto-Refresh Interval (seconds)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="refresh"
                      type="number"
                      value={autoRefreshInterval}
                      onChange={(e) => setAutoRefreshInterval(e.target.value)}
                      className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
                    />
                    <div className="flex gap-1">
                      {['5', '10', '30', '60'].map((val) => (
                        <Button
                          key={val}
                          variant={autoRefreshInterval === val ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAutoRefreshInterval(val)}
                        >
                          {val}s
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Table Row Density</Label>
                  <div className="flex gap-2">
                    {['compact', 'normal', 'comfortable'].map((density) => (
                      <Button
                        key={density}
                        variant={rowDensity === density ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRowDensity(density)}
                        className="capitalize"
                      >
                        {density}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Default Export Format</Label>
                  <div className="flex gap-2">
                    {['csv', 'json', 'pdf'].map((format) => (
                      <Button
                        key={format}
                        variant={exportFormat === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat(format)}
                        className="uppercase"
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={alertNotifications}
                    onChange={(e) => setAlertNotifications(e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts within the application</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={soundNotifications}
                    onChange={(e) => setSoundNotifications(e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">Sound Notifications</p>
                    <p className="text-sm text-muted-foreground">Play sound for critical alerts</p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="mt-6">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced detection parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Rule Sensitivity Level</Label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <Button
                        key={level}
                        variant={ruleSensitivity === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRuleSensitivity(level)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Higher sensitivity may increase false positives
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm">
                    <span className="font-semibold">Tip:</span> Adjust sensitivity based on your environment's baseline activity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-3 justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}