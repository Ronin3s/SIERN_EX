import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Shield,
  Search,
  AlertTriangle,
  Zap,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/' },
  { label: 'Process Monitor', icon: <Activity className="h-5 w-5" />, path: '/processes' },
  { label: 'Integrity Scanner', icon: <Shield className="h-5 w-5" />, path: '/scanner' },
  { label: 'IOC Hunt', icon: <Search className="h-5 w-5" />, path: '/ioc-hunt' },
  { label: 'Behavioral Detection', icon: <AlertTriangle className="h-5 w-5" />, path: '/behavioral' },
  { label: 'Response Center', icon: <Zap className="h-5 w-5" />, path: '/response' },
  { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-white/10 dark:border-slate-700/50 bg-gradient-to-b from-white/40 to-white/20 dark:from-slate-900/40 dark:to-slate-900/20 backdrop-blur-md overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 text-base',
                  isActive && 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Button>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}