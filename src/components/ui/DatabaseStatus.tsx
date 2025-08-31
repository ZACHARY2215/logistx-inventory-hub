import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const DatabaseStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [stats, setStats] = useState<{
    items: number;
    categories: number;
    suppliers: number;
    users: number;
  } | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      // Test basic connection
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('count', { count: 'exact', head: true });

      if (itemsError) throw itemsError;

      // Get counts from different tables
      const [itemsCount, categoriesCount, suppliersCount, usersCount] = await Promise.all([
        supabase.from('inventory_items').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        items: itemsCount.count || 0,
        categories: categoriesCount.count || 0,
        suppliers: suppliersCount.count || 0,
        users: usersCount.count || 0
      });

      setStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Database connection error:', error);
      setStatus('error');
      setStats(null);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>
          Real-time connection and data status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge variant="outline" className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </Badge>
        </div>

        {stats && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Data Summary:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">{stats.items}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-medium">{stats.categories}</span>
              </div>
              <div className="flex justify-between">
                <span>Suppliers:</span>
                <span className="font-medium">{stats.suppliers}</span>
              </div>
              <div className="flex justify-between">
                <span>Users:</span>
                <span className="font-medium">{stats.users}</span>
              </div>
            </div>
          </div>
        )}

        {lastChecked && (
          <div className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        <Button 
          onClick={checkConnection} 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={status === 'checking'}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${status === 'checking' ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};
