/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  BarChart3,
  Activity,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { 
  getTokenUsageApi, 
  getTokenHistoryApi, 
  getTokenStatisticsApi,
  getEstimatedRequestsApi 
} from '@/api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function TokenUsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usageData, historyData, statsData, estimatesData] = await Promise.all([
        getTokenUsageApi(),
        getTokenHistoryApi({ limit: 10 }),
        getTokenStatisticsApi(),
        getEstimatedRequestsApi(),
      ]);
      
      setUsage(usageData);
      setHistory(historyData.usage || []);
      setStatistics(statsData.statistics || []);
      setEstimates(estimatesData);
    } catch (error: any) {
      console.error('Error fetching token data:', error);
      toast.error('Failed to load token usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Token Usage</h1>
            <p className="text-gray-500 mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subscription Found</h3>
            <p className="text-gray-500 mb-4">Subscribe to a plan to start using AI features</p>
            <Button onClick={() => navigate('/dashboard/billing')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = parseFloat(usage.tokens.usagePercentage);
  const isLow = percentage > 80;
  const isCritical = percentage > 95;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Token Usage
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor your AI token consumption and usage patterns
          </p>
        </div>
        <Button onClick={fetchAllData} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Critical Warning */}
      {isCritical && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                AI Tokens Almost Depleted!
              </h3>
              <p className="text-sm text-red-700 mb-3">
                You've used {percentage.toFixed(0)}% of your AI tokens. Upgrade your plan to continue using AI features.
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate('/dashboard/billing')}
                className="bg-red-600 hover:bg-red-700"
              >
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tokens */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {usage.formatted.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {usage.tokens.total.toLocaleString()} allocated
            </p>
            <Badge variant="secondary" className="mt-2">
              {usage.subscription.plan}
            </Badge>
          </CardContent>
        </Card>

        {/* Tokens Used */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {usage.formatted.used}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {usage.tokens.used.toLocaleString()} consumed
            </p>
            <Badge variant="outline" className="mt-2">
              {percentage.toFixed(1)}% of total
            </Badge>
          </CardContent>
        </Card>

        {/* Tokens Remaining */}
        <Card className={isLow ? 'border-yellow-300 bg-yellow-50' : isCritical ? 'border-red-300 bg-red-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tokens Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isCritical ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>
              {usage.formatted.remaining}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {usage.tokens.remaining.toLocaleString()} available
            </p>
            {isLow && (
              <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                Running Low
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Reset Date */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Resets On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Date(usage.tokens.resetDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.ceil((new Date(usage.tokens.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics by Feature */}
      {statistics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Usage by Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.map((stat: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.featureName}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{stat.requestCount} requests</span>
                      <span className="font-semibold text-gray-900">
                        {stat.totalTokens.toLocaleString()} tokens
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(stat.totalTokens / usage.tokens.used) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: {stat.averageTokensPerRequest} tokens/request
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimated Requests Remaining */}
      {estimates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Estimated Requests Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estimates.estimates?.map((estimate: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {estimate.featureName}
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ~{estimate.estimatedRequests}
                  </div>
                  <div className="text-xs text-gray-500">
                    requests left (~{estimate.costRange.average} tokens each)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Recent Activity
              </CardTitle>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => navigate('/dashboard/token-history')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${record.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="text-sm font-medium">{record.featureName}</div>
                      <div className="text-xs text-gray-500">
                        {record.user.firstName} {record.user.lastName} • {new Date(record.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {record.tokensUsed} tokens
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

