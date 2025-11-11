/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { getTokenUsageApi } from '@/api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TokenUsage {
  organization: {
    id: string;
    name: string;
  };
  subscription: {
    plan: string;
    status: string;
  };
  tokens: {
    total: number;
    used: number;
    remaining: number;
    usagePercentage: string;
    resetDate: string;
  };
  formatted: {
    total: string;
    used: string;
    remaining: string;
  };
  statistics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: string;
    mostUsedFeature: {
      feature: string;
      featureName: string;
      count: number;
    } | null;
  };
}

export default function TokenUsageWidget() {
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTokenUsage();
  }, []);

  const fetchTokenUsage = async () => {
    try {
      setLoading(true);
      const data = await getTokenUsageApi();
      setUsage(data);
    } catch (error: any) {
      console.error('Error fetching token usage:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load token usage');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No subscription found</p>
            <Button onClick={() => navigate('/dashboard/billing')}>
              Subscribe Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = parseFloat(usage.tokens.usagePercentage);
  const isLow = percentage > 80;
  const isCritical = percentage > 95;

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isLow) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    if (isCritical) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Critical
        </Badge>
      );
    }
    if (isLow) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Low
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
        Healthy
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Token Usage
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tokens</span>
            <span className="text-sm text-gray-500">
              {percentage.toFixed(1)}% used
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className="h-3"
            indicatorClassName={getProgressColor()}
          />
          
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-bold text-2xl text-gray-900">
                {usage.formatted.remaining}
              </span>
              <span className="text-gray-500 ml-1">remaining</span>
            </div>
            <div className="text-right">
              <div className="text-gray-600">
                {usage.formatted.used} / {usage.formatted.total}
              </div>
              <div className="text-xs text-gray-500">
                {usage.tokens.remaining.toLocaleString()} / {usage.tokens.total.toLocaleString()} tokens
              </div>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {isCritical && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Almost Out of Tokens!
                </p>
                <p className="text-xs text-red-700 mt-1">
                  You've used {percentage.toFixed(0)}% of your AI tokens. Upgrade your plan or wait until reset.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLow && !isCritical && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Running Low on Tokens
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  You've used {percentage.toFixed(0)}% of your AI tokens. Consider upgrading for more.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <TrendingUp className="h-3 w-3" />
              AI Requests
            </div>
            <div className="text-xl font-bold text-gray-900">
              {usage.statistics.totalRequests}
            </div>
            <div className="text-xs text-gray-500">
              {usage.statistics.successRate}% success
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              Resets On
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {new Date(usage.tokens.resetDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="text-xs text-gray-500">
              {Math.ceil((new Date(usage.tokens.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
            </div>
          </div>
        </div>

        {/* Most Used Feature */}
        {usage.statistics.mostUsedFeature && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-xs text-purple-700 font-medium mb-1">
              Most Used Feature
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-900">
                {usage.statistics.mostUsedFeature.featureName}
              </span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {usage.statistics.mostUsedFeature.count} times
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/billing')}
            className="flex-1"
          >
            Manage Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/token-usage')}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

