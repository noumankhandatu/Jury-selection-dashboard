import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getSubscriptionApi, getBillingPortalApi, getTokenUsageApi } from "@/api/api";
import { CreditCard, Calendar, Users, TrendingUp, ExternalLink, Loader2, CheckCircle, Sparkles, AlertCircle, BarChart3 } from "lucide-react";
import TitleTag from "@/components/shared/tag/tag";

interface Subscription {
  id: string;
  plan: "STANDARD" | "BUSINESS";
  status: string;
  teamMemberLimit: number;
  currentMemberCount: number;
  canAddMembers: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  canceledAt?: string;
  stripeCancelAtPeriodEnd?: boolean;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  const organizationId = localStorage.getItem("organizationId");
  const organizationName = localStorage.getItem("organizationName");

  useEffect(() => {
    if (organizationId) {
      fetchSubscription();
      fetchTokenUsage();
    }
  }, [organizationId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionApi(organizationId!);
      setSubscription(response.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenUsage = async () => {
    try {
      setTokenLoading(true);
      const data = await getTokenUsageApi();
      setTokenUsage(data);
    } catch (error: any) {
      console.error("Error fetching token usage:", error);
      // Don't show error toast if it's just a 404 (no subscription)
      if (error.response?.status !== 404 && error.response?.status !== 403) {
        toast.error("Failed to load token usage");
      }
    } finally {
      setTokenLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await getBillingPortalApi(organizationId!);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
      TRIALING: { bg: "bg-blue-100", text: "text-blue-700" },
      PAST_DUE: { bg: "bg-red-100", text: "text-red-700" },
      CANCELED: { bg: "bg-gray-100", text: "text-gray-700" },
    };

    const variant = variants[status] || variants.ACTIVE;

    return (
      <Badge className={`${variant.bg} ${variant.text} border-0`}>
        {status}
      </Badge>
    );
  };

  const getPlanDetails = (plan: "STANDARD" | "BUSINESS") => {
    const plans = {
      STANDARD: {
        name: "Standard Plan",
        price: 29,
        features: ["1 team member", "10,000 AI tokens/month", "Unlimited cases", "AI assessments", "Email notifications"],
      },
      BUSINESS: {
        name: "Business Plan",
        price: 79,
        features: ["Up to 3 team members", "50,000 AI tokens/month", "Unlimited cases", "AI assessments", "Team collaboration", "Priority support"],
      },
    };

    return plans[plan];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
        <div className="text-center">
          <p className="text-gray-600">No subscription found</p>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(subscription.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <TitleTag title="Billing & Subscription" />

        {/* Current Plan */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Current Subscription
                </CardTitle>
                <CardDescription>{organizationName}</CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{planDetails.name}</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ${planDetails.price}
                    <span className="text-lg text-gray-600">/month</span>
                  </p>
                </div>
                <Button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage Billing
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Team Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {subscription.currentMemberCount}/{subscription.teamMemberLimit}
                    </p>
                  </div>
                </div>
                {!subscription.canAddMembers && (
                  <Badge className="bg-orange-100 text-orange-700 text-xs">Limit reached</Badge>
                )}
              </div>

              {/* Next Billing */}
              {subscription.currentPeriodEnd && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Billing</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trial Info */}
              {subscription.status === "TRIALING" && subscription.trialEndsAt && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trial Ends</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(subscription.trialEndsAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Notice */}
            {subscription.stripeCancelAtPeriodEnd && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-900 font-medium">
                  Your subscription will be canceled on{" "}
                  {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  You can reactivate your subscription anytime before this date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Token Usage */}
        {!tokenLoading && tokenUsage && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Token Usage
                  </CardTitle>
                  <CardDescription>Track your AI feature consumption</CardDescription>
                </div>
                {(() => {
                  const percentage = parseFloat(tokenUsage.tokens.usagePercentage);
                  const isLow = percentage > 80;
                  const isCritical = percentage > 95;
                  
                  if (isCritical) {
                    return (
                      <Badge className="bg-red-100 text-red-700 border-0 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Critical
                      </Badge>
                    );
                  }
                  if (isLow) {
                    return (
                      <Badge className="bg-yellow-100 text-yellow-700 border-0 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Low
                      </Badge>
                    );
                  }
                  return (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Healthy
                    </Badge>
                  );
                })()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Tokens */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Tokens</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tokenUsage.formatted.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tokenUsage.tokens.total.toLocaleString()} allocated
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tokens Used */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tokens Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tokenUsage.formatted.used}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tokenUsage.tokens.usagePercentage}% consumed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tokens Remaining */}
                <div className={`border rounded-lg p-4 ${
                  parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                    ? 'bg-red-50 border-red-200' 
                    : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                        ? 'bg-red-100' 
                        : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                        ? 'bg-yellow-100' 
                        : 'bg-green-100'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${
                        parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                          ? 'text-red-600' 
                          : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className={`text-2xl font-bold ${
                        parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                          ? 'text-red-600' 
                          : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {tokenUsage.formatted.remaining}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tokenUsage.tokens.remaining.toLocaleString()} left
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Token Usage</span>
                  <span className="text-gray-600">
                    {tokenUsage.tokens.usagePercentage}% used
                  </span>
                </div>
                <Progress 
                  value={parseFloat(tokenUsage.tokens.usagePercentage)} 
                  className="h-3"
                  indicatorClassName={
                    parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                      ? 'bg-red-500' 
                      : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0 tokens</span>
                  <span>{tokenUsage.tokens.total.toLocaleString()} tokens</span>
                </div>
              </div>

              {/* Warning Messages */}
              {parseFloat(tokenUsage.tokens.usagePercentage) > 95 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Almost Out of AI Tokens!
                      </p>
                      <p className="text-xs text-red-700">
                        You've used {tokenUsage.tokens.usagePercentage}% of your AI tokens. 
                        {subscription?.plan === "STANDARD" 
                          ? " Upgrade to Business plan for 5x more tokens (50,000/month)." 
                          : " Your tokens will reset on " + new Date(tokenUsage.tokens.resetDate).toLocaleDateString() + "."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parseFloat(tokenUsage.tokens.usagePercentage) > 80 && parseFloat(tokenUsage.tokens.usagePercentage) <= 95 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Running Low on AI Tokens
                      </p>
                      <p className="text-xs text-yellow-700">
                        You've used {tokenUsage.tokens.usagePercentage}% of your AI tokens. 
                        {subscription?.plan === "STANDARD" 
                          ? " Consider upgrading to Business plan for more tokens." 
                          : " Monitor your usage to avoid running out."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600">AI Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tokenUsage.statistics.totalRequests}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tokenUsage.statistics.successRate}% success
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Resets On</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(tokenUsage.tokens.resetDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(tokenUsage.tokens.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </p>
                </div>

                {tokenUsage.statistics.mostUsedFeature && (
                  <>
                    <div className="text-center md:col-span-2">
                      <p className="text-sm text-gray-600">Most Used Feature</p>
                      <p className="text-lg font-bold text-purple-600">
                        {tokenUsage.statistics.mostUsedFeature.featureName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tokenUsage.statistics.mostUsedFeature.count} times
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Option */}
        {subscription.plan === "STANDARD" && (
          <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Upgrade to Business Plan
              </CardTitle>
              <CardDescription>
                Add team members and unlock collaboration features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Business Plan - $79/month
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Up to 3 team members</li>
                    <li>• 50,000 AI tokens/month (5x more!)</li>
                    <li>• Team collaboration features</li>
                    <li>• Activity logs & audit trails</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <Button
                  onClick={handleManageBilling}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">
              • Update payment method, view invoices, and manage your subscription in the{" "}
              <button onClick={handleManageBilling} className="text-blue-600 hover:underline font-medium">
                Billing Portal
              </button>
            </p>
            <p className="text-gray-600">
              • Questions? Contact us at{" "}
              <a href="mailto:support@jurydutysaas.com" className="text-blue-600 hover:underline">
                support@jurydutysaas.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

