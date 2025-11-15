import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getSubscriptionApi,
  getBillingPortalApi,
  getTokenUsageApi,
  reactivateSubscriptionApi,
  createCheckoutSessionApi,
  cancelSubscriptionApi,
} from "@/api/api";
import {
  CreditCard,
  Calendar,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  Sparkles,
  AlertCircle,
  BarChart3,
  RefreshCw,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
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
  stripeCancelAt?: string;
  stripeSubscriptionId?: string;
}

type SubscriptionState =
  | "ACTIVE_TRIAL"
  | "TRIAL_ENDING_SOON"
  | "TRIAL_ENDED_CANCELLED"
  | "ACTIVE_CANCELLING"
  | "CANCELLED"
  | "EXPIRED"
  | "ACTIVE"
  | "PAST_DUE";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  const organizationId = localStorage.getItem("organizationId");
  const organizationName = localStorage.getItem("organizationName");

  useEffect(() => {
    if (organizationId) {
      fetchSubscription(true); // Show loading on initial load
      fetchTokenUsage();
    }

    // Check if returning from Stripe portal
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get("from") === "stripe";
    
    if (fromStripe) {
      // Remove the query parameter from URL
      window.history.replaceState({}, "", window.location.pathname);
      
      // Force refresh subscription data
      setTimeout(() => {
        fetchSubscription(false); // Don't show loading spinner to prevent blinking
        fetchTokenUsage();
        toast.success("Subscription updated successfully!");
      }, 500);
    }

    // Only refresh on window focus (not visibility change) to avoid blinking
    // This handles the case when user returns from Stripe portal in a new tab
    let lastFocusTime = Date.now();
    const handleFocus = () => {
      const now = Date.now();
      // Only refresh if focus happened more than 2 seconds ago (prevents rapid refreshes)
      if (now - lastFocusTime > 2000 && organizationId) {
        lastFocusTime = now;
        // Small delay to ensure any redirect completed
        // Don't show loading spinner on focus refresh to prevent blinking
        setTimeout(() => {
          fetchSubscription(false);
        }, 300);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [organizationId]);

  const fetchSubscription = async (showLoading: boolean = false) => {
    try {
      // Only show loading spinner on initial load or manual refresh
      if (showLoading) {
      setLoading(true);
      }
      const response = await getSubscriptionApi(organizationId!);
      setSubscription(response.subscription);
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
      
      // Don't show error toast for inactive subscriptions - we'll show UI instead
      if (error.response?.status !== 403 || error.response?.data?.error !== 'Subscription inactive') {
      toast.error("Failed to load subscription details");
      }
    } finally {
      if (showLoading) {
      setLoading(false);
      }
    }
  };

  const fetchTokenUsage = async () => {
    try {
      setTokenLoading(true);
      const data = await getTokenUsageApi();
      setTokenUsage(data);
    } catch (error: any) {
      console.error("Error fetching token usage:", error);
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

  const handleCancelSubscription = async (immediately: boolean = false) => {
    if (!organizationId) return;

    setCancelling(true);
    try {
      await cancelSubscriptionApi(organizationId, immediately);
      toast.success(
        immediately
          ? "Subscription cancelled immediately"
          : "Subscription will be cancelled at the end of the billing period"
      );
      await fetchSubscription(false);
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast.error(
        error?.response?.data?.error || "Failed to cancel subscription"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!organizationId) return;

    setReactivating(true);
    try {
      await reactivateSubscriptionApi(organizationId);
      toast.success("Subscription reactivated successfully!");
      await fetchSubscription(false);
    } catch (error: any) {
      console.error("Error reactivating subscription:", error);
      toast.error(
        error?.response?.data?.error || "Failed to reactivate subscription"
      );
    } finally {
      setReactivating(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!organizationId || !subscription) return;

    try {
      const response = await createCheckoutSessionApi({
        plan: subscription.plan,
        organizationId,
        returnTo: "/dashboard/billing", // Redirect back to billing page after renewal
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error?.response?.data?.error || "Failed to create checkout session"
      );
    }
  };

  const handleUpgradeToBusiness = async () => {
    if (!organizationId) return;

    try {
      const response = await createCheckoutSessionApi({
        plan: "BUSINESS",
        organizationId,
        returnTo: "/dashboard/billing", // Redirect back to billing page after upgrade
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error?.response?.data?.error || "Failed to create checkout session"
      );
    }
  };

  // Determine subscription state
  const getSubscriptionState = (): SubscriptionState => {
    if (!subscription) return "ACTIVE";

    const now = new Date();
    const status = subscription.status.toUpperCase();
    const trialEndsAt = subscription.trialEndsAt
      ? new Date(subscription.trialEndsAt)
      : null;
    const currentPeriodEnd = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : null;
    const canceledAt = subscription.canceledAt
      ? new Date(subscription.canceledAt)
      : null;
    const isCancelling = subscription.stripeCancelAtPeriodEnd === true;

    // Check if subscription has expired
    if (
      currentPeriodEnd &&
      currentPeriodEnd < now &&
      (status === "CANCELED" || isCancelling)
    ) {
      return "EXPIRED";
    }

    // Fully cancelled
    if (status === "CANCELED" && canceledAt) {
      return "CANCELLED";
    }

    // Trial ended and cancelled
    if (trialEndsAt && trialEndsAt < now && isCancelling) {
      return "TRIAL_ENDED_CANCELLED";
    }

    // Active but cancelling
    if (isCancelling && (status === "ACTIVE" || status === "TRIALING")) {
      return "ACTIVE_CANCELLING";
    }

    // Trial ending soon (within 7 days)
    if (status === "TRIALING" && trialEndsAt) {
      const daysUntilTrialEnd = Math.ceil(
        (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilTrialEnd <= 7 && daysUntilTrialEnd > 0) {
        return "TRIAL_ENDING_SOON";
      }
      if (trialEndsAt > now) {
        return "ACTIVE_TRIAL";
      }
    }

    // Active trial
    if (status === "TRIALING" && trialEndsAt && trialEndsAt > now) {
      return "ACTIVE_TRIAL";
    }

    // Past due
    if (status === "PAST_DUE") {
      return "PAST_DUE";
    }

    // Active
    return "ACTIVE";
  };

  const subscriptionState = getSubscriptionState();

  const getStatusBadge = () => {
    const variants: Record<
      SubscriptionState,
      { bg: string; text: string; label: string }
    > = {
      ACTIVE_TRIAL: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "TRIALING",
      },
      TRIAL_ENDING_SOON: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "TRIAL ENDING SOON",
      },
      TRIAL_ENDED_CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "TRIAL ENDED - CANCELLED",
      },
      ACTIVE_CANCELLING: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "CANCELLING",
      },
      CANCELLED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "CANCELLED",
      },
      EXPIRED: { bg: "bg-red-100", text: "text-red-700", label: "EXPIRED" },
      ACTIVE: { bg: "bg-green-100", text: "text-green-700", label: "ACTIVE" },
      PAST_DUE: { bg: "bg-red-100", text: "text-red-700", label: "PAST DUE" },
    };

    const variant = variants[subscriptionState];

    return (
      <Badge className={`${variant.bg} ${variant.text} border-0`}>
        {variant.label}
      </Badge>
    );
  };

  const getPlanDetails = (plan: "STANDARD" | "BUSINESS") => {
    const plans = {
      STANDARD: {
        name: "Standard Plan",
        price: 29,
        features: [
          "2 team members",
          "1,000,000 AI tokens/month",
          "Unlimited cases",
          "AI assessments",
          "Email notifications",
        ],
      },
      BUSINESS: {
        name: "Business Plan",
        price: 79,
        features: [
          "Up to 5 team members",
          "2,000,000 AI tokens/month",
          "Unlimited cases",
          "AI assessments",
          "Team collaboration",
          "Priority support",
        ],
      },
    };

    return plans[plan];
  };

  const getDaysUntil = (date: Date | null): number => {
    if (!date) return 0;
    return Math.ceil(
      (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
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
        <div className="max-w-6xl mx-auto space-y-6">
          <TitleTag title="Billing & Subscription" />
          
          <Card className="border-none shadow-lg">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 mx-auto text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">No Subscription Found</h2>
                <p className="text-gray-600 mb-6">
                  Your organization doesn't have an active subscription. Please select a plan to continue.
                </p>
                <Button
                  onClick={() => window.location.href = "/subscription/select"}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Select Subscription Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(subscription.plan);
  const trialEndsAt = subscription.trialEndsAt
    ? new Date(subscription.trialEndsAt)
    : null;
  const currentPeriodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const daysUntilTrialEnd = getDaysUntil(trialEndsAt);
  const daysUntilPeriodEnd = getDaysUntil(currentPeriodEnd);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <TitleTag title="Billing & Subscription" />

        {/* Tabs */}
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger
              value="token-usage"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Token Usage
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6 mt-0">
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
                  {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
                {/* Trial Status Banner */}
                {subscriptionState === "ACTIVE_TRIAL" && trialEndsAt && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                          You're on a Free Trial
                        </h3>
                        <p className="text-sm text-blue-800 mb-3">
                          Your free trial ends on{" "}
                          <span className="font-semibold">
                            {trialEndsAt.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>{" "}
                          ({daysUntilTrialEnd}{" "}
                          {daysUntilTrialEnd === 1 ? "day" : "days"} remaining)
                        </p>
                        {subscription.stripeCancelAtPeriodEnd && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-yellow-800">
                              <AlertCircle className="h-4 w-4 inline mr-1" />
                              Your subscription is set to cancel when the trial
                              ends. After{" "}
                              <span className="font-semibold">
                                {trialEndsAt.toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              , this service will no longer be available.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trial Ending Soon Banner */}
                {subscriptionState === "TRIAL_ENDING_SOON" && trialEndsAt && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-900 mb-2">
                          Trial Ending Soon
                        </h3>
                        <p className="text-sm text-yellow-800 mb-3">
                          Your free trial ends in{" "}
                          <span className="font-semibold">
                            {daysUntilTrialEnd}{" "}
                            {daysUntilTrialEnd === 1 ? "day" : "days"}
                          </span>{" "}
                          on{" "}
                          <span className="font-semibold">
                            {trialEndsAt.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                        {subscription.stripeCancelAtPeriodEnd ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-red-800 mb-3">
                              <XCircle className="h-4 w-4 inline mr-1" />
                              Your subscription is set to cancel when the trial
                              ends. After{" "}
                              <span className="font-semibold">
                                {trialEndsAt.toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              , this service will no longer be available.
                            </p>
                            <Button
                              onClick={handleReactivate}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={reactivating}
                            >
                              {reactivating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Reactivating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Don't Cancel Subscription
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-700">
                            Your subscription will continue automatically after
                            the trial ends.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trial Ended & Cancelled Banner */}
                {subscriptionState === "TRIAL_ENDED_CANCELLED" &&
                  trialEndsAt && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900 mb-2">
                            Trial Ended - Subscription Cancelled
                          </h3>
                          <p className="text-sm text-red-800 mb-4">
                            Your free trial ended on{" "}
                            <span className="font-semibold">
                              {trialEndsAt.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            . Your subscription has been cancelled and this
                            service is no longer available.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={handleRenewSubscription}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Renew {subscription.plan === "STANDARD" ? "Standard" : "Business"} Plan
                            </Button>
                            {subscription.plan === "STANDARD" && (
                              <Button
                                onClick={handleUpgradeToBusiness}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Upgrade to Business
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            Note: Billing portal is not available for cancelled subscriptions. Please renew or upgrade to access billing management.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Active but Cancelling Banner */}
                {subscriptionState === "ACTIVE_CANCELLING" &&
                  (currentPeriodEnd || trialEndsAt) && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-orange-900 mb-2">
                            Subscription Cancelled
                          </h3>
                          {subscription.status === "TRIALING" && trialEndsAt ? (
                            // Trial cancellation - user hasn't paid yet
                            <>
                              <p className="text-sm text-orange-800 mb-3">
                                <strong>Your subscription has been cancelled.</strong> You're currently on a free trial, so you won't be charged.
                              </p>
                              <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>What happens next:</strong>
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                                  <li>Your free trial will continue until{" "}
                                    <span className="font-semibold text-orange-900">
                                      {trialEndsAt.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {" "}({daysUntilTrialEnd}{" "}
                                    {daysUntilTrialEnd === 1 ? "day" : "days"} remaining)
                                  </li>
                                  <li>You can continue using all features until the trial ends</li>
                                  <li>After the trial ends, your account will be cancelled and you won't be charged</li>
                                </ul>
                              </div>
                            </>
                          ) : currentPeriodEnd ? (
                            // Paid subscription cancellation - user has already paid
                            <>
                              <p className="text-sm text-orange-800 mb-3">
                                <strong>Your subscription has been cancelled.</strong> You've already paid for this billing period, so you can continue using the service.
                              </p>
                              <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>What happens next:</strong>
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                                  <li>You can continue using all features until{" "}
                                    <span className="font-semibold text-orange-900">
                                      {currentPeriodEnd.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {" "}({daysUntilPeriodEnd}{" "}
                                    {daysUntilPeriodEnd === 1 ? "day" : "days"} remaining)
                                  </li>
                                  <li>After this date, your subscription will end and you won't be charged again</li>
                                  <li>No refunds are issued for the current billing period</li>
                                </ul>
                              </div>
                            </>
                          ) : null}
                          <div className="flex gap-3">
                            <Button
                              onClick={handleReactivate}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={reactivating}
                            >
                              {reactivating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Reactivating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Don't Cancel Subscription
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={handleManageBilling}
                              variant="outline"
                              disabled={portalLoading}
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
                        </div>
                      </div>
                    </div>
                  )}

                {/* Fully Cancelled Banner */}
                {subscriptionState === "CANCELLED" && (
                  <div className="bg-gradient-to-r from-red-50 to-gray-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          Subscription Cancelled
                        </h3>
                        {subscription.canceledAt && (
                          <p className="text-sm text-red-800 mb-4">
                            Your subscription was cancelled on{" "}
                            <span className="font-semibold">
                              {new Date(
                                subscription.canceledAt
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            . This service is no longer available.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={handleRenewSubscription}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Renew {subscription.plan === "STANDARD" ? "Standard" : "Business"} Plan
                          </Button>
                          {subscription.plan === "STANDARD" && (
                            <Button
                              onClick={handleUpgradeToBusiness}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Upgrade to Business
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Note: Billing portal is not available for cancelled subscriptions. Please renew or upgrade to access billing management.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expired Banner */}
                {subscriptionState === "EXPIRED" && (
                  <div className="bg-gradient-to-r from-red-50 to-gray-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          Subscription Expired
                        </h3>
                        {currentPeriodEnd && (
                          <p className="text-sm text-red-800 mb-4">
                            Your subscription expired on{" "}
                            <span className="font-semibold">
                              {currentPeriodEnd.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            . This service is no longer available.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={handleRenewSubscription}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Renew {subscription.plan === "STANDARD" ? "Standard" : "Business"} Plan
                          </Button>
                          {subscription.plan === "STANDARD" && (
                            <Button
                              onClick={handleUpgradeToBusiness}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Upgrade to Business
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Note: Billing portal is not available for expired subscriptions. Please renew or upgrade to access billing management.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Details - Always show current plan, even when expired */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {planDetails.name}
                        </h3>
                        {(subscriptionState === "CANCELLED" ||
                          subscriptionState === "EXPIRED" ||
                          subscriptionState === "TRIAL_ENDED_CANCELLED") && (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                  <p className="text-3xl font-bold text-blue-600">
                    ${planDetails.price}
                    <span className="text-lg text-gray-600">/month</span>
                  </p>
                </div>
                    {/* Show action buttons only if subscription is active */}
                    {subscriptionState !== "CANCELLED" &&
                      subscriptionState !== "EXPIRED" &&
                      subscriptionState !== "TRIAL_ENDED_CANCELLED" && (
                        <div className="flex gap-2">
                          {/* Cancel Subscription Button - Only show if not already cancelling */}
                          {subscriptionState !== "ACTIVE_CANCELLING" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  disabled={cancelling}
                                >
                                  {cancelling ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancel Subscription
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Subscription?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {subscriptionState === "ACTIVE_TRIAL" ||
                                    subscriptionState === "TRIAL_ENDING_SOON" ? (
                                      <>
                                        Your subscription will be cancelled when
                                        your free trial ends on{" "}
                                        {trialEndsAt?.toLocaleDateString("en-US", {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                        . You'll retain access until then.
                                      </>
                                    ) : (
                                      <>
                                        Your subscription will be cancelled at
                                        the end of your current billing period
                                        on{" "}
                                        {currentPeriodEnd?.toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                          }
                                        )}
                                        . You'll retain access until then.
                                      </>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleCancelSubscription(false)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Cancel at Period End
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {/* Manage Billing Button */}
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
                      )}
              </div>

              <div className="space-y-2">
                {planDetails.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

                  {/* Show upgrade option for Standard plan when expired */}
                  {subscription.plan === "STANDARD" &&
                    (subscriptionState === "CANCELLED" ||
                      subscriptionState === "EXPIRED" ||
                      subscriptionState === "TRIAL_ENDED_CANCELLED") && (
                      <div className="mt-6 pt-6 border-t border-blue-200">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Upgrade to Business Plan
                              </h4>
                              <p className="text-sm text-purple-800 mb-3">
                                Get 2x more tokens (2,000,000/month), up to 5 team
                                members, and priority support
                              </p>
                              <p className="text-lg font-bold text-purple-900">
                                $79<span className="text-sm text-gray-600">/month</span>
                              </p>
                            </div>
                            <Button
                              onClick={handleUpgradeToBusiness}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white ml-4"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Upgrade Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
                          {subscription.currentMemberCount}/
                          {subscription.teamMemberLimit}
                    </p>
                  </div>
                </div>
                {!subscription.canAddMembers && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        Limit reached
                      </Badge>
                )}
              </div>

                  {/* Trial Ends / Next Billing */}
                  {subscriptionState === "ACTIVE_TRIAL" ||
                  subscriptionState === "TRIAL_ENDING_SOON" ? (
                    trialEndsAt && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trial Ends</p>
                            <p className="text-lg font-bold text-gray-900">
                              {trialEndsAt.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {daysUntilTrialEnd}{" "}
                              {daysUntilTrialEnd === 1 ? "day" : "days"} left
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : currentPeriodEnd ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                          <p className="text-sm text-gray-600">
                            {subscriptionState === "ACTIVE_CANCELLING"
                              ? "Cancels On"
                              : "Next Billing"}
                          </p>
                      <p className="text-lg font-bold text-gray-900">
                            {currentPeriodEnd.toLocaleDateString()}
                      </p>
                          {subscriptionState === "ACTIVE_CANCELLING" &&
                            daysUntilPeriodEnd > 0 && (
                              <p className="text-xs text-gray-500">
                                {daysUntilPeriodEnd}{" "}
                                {daysUntilPeriodEnd === 1 ? "day" : "days"} left
                              </p>
                            )}
                    </div>
                  </div>
                </div>
                  ) : null}

                  {/* Cancellation Date */}
                  {(subscriptionState === "CANCELLED" ||
                    subscriptionState === "EXPIRED") &&
                    subscription.canceledAt && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                            <p className="text-sm text-gray-600">
                              Cancelled On
                            </p>
                      <p className="text-lg font-bold text-gray-900">
                              {new Date(
                                subscription.canceledAt
                              ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">
                  • Update payment method, view invoices, and manage your
                  subscription in the{" "}
                  <button
                    onClick={handleManageBilling}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Billing Portal
                  </button>
                </p>
                <p className="text-gray-600">
                  • Questions? Contact us at{" "}
                  <a
                    href="mailto:support@jurydutysaas.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@jurydutysaas.com
                  </a>
                </p>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Token Usage Tab */}
          <TabsContent value="token-usage" className="space-y-6 mt-0">
            {/* AI Token Usage - Only show if subscription is active */}
            {!tokenLoading &&
            tokenUsage &&
            subscriptionState !== "CANCELLED" &&
            subscriptionState !== "EXPIRED" &&
            subscriptionState !== "TRIAL_ENDED_CANCELLED" ? (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Token Usage
                  </CardTitle>
                      <CardDescription>
                        Track your AI feature consumption
                      </CardDescription>
                </div>
                {(() => {
                      const percentage = parseFloat(
                        tokenUsage.tokens.usagePercentage
                      );
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
                    <div
                      className={`border rounded-lg p-4 ${
                  parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                          ? "bg-red-50 border-red-200"
                    : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                  <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                              ? "bg-red-100"
                              : parseFloat(tokenUsage.tokens.usagePercentage) >
                                80
                              ? "bg-yellow-100"
                              : "bg-green-100"
                          }`}
                        >
                          <TrendingUp
                            className={`w-5 h-5 ${
                        parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                                ? "text-red-600"
                                : parseFloat(
                                    tokenUsage.tokens.usagePercentage
                                  ) > 80
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                          <p
                            className={`text-2xl font-bold ${
                        parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                                ? "text-red-600"
                                : parseFloat(
                                    tokenUsage.tokens.usagePercentage
                                  ) > 80
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
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
                      <span className="font-medium text-gray-700">
                        Token Usage
                      </span>
                  <span className="text-gray-600">
                    {tokenUsage.tokens.usagePercentage}% used
                  </span>
                </div>
                <Progress 
                  value={parseFloat(tokenUsage.tokens.usagePercentage)} 
                  className="h-3"
                  indicatorClassName={
                    parseFloat(tokenUsage.tokens.usagePercentage) > 95 
                          ? "bg-red-500"
                      : parseFloat(tokenUsage.tokens.usagePercentage) > 80 
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0 tokens</span>
                      <span>
                        {tokenUsage.tokens.total.toLocaleString()} tokens
                      </span>
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
                            You've used {tokenUsage.tokens.usagePercentage}% of
                            your AI tokens.
                        {subscription?.plan === "STANDARD" 
                              ? " Upgrade to Business plan for 2x more tokens (2,000,000/month)."
                              : " Your tokens will reset on " +
                                new Date(
                                  tokenUsage.tokens.resetDate
                                ).toLocaleDateString() +
                                "."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

                  {parseFloat(tokenUsage.tokens.usagePercentage) > 80 &&
                    parseFloat(tokenUsage.tokens.usagePercentage) <= 95 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Running Low on AI Tokens
                      </p>
                      <p className="text-xs text-yellow-700">
                              You've used {tokenUsage.tokens.usagePercentage}%
                              of your AI tokens.
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
                        {new Date(
                          tokenUsage.tokens.resetDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                        {Math.ceil(
                          (new Date(tokenUsage.tokens.resetDate).getTime() -
                            Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days left
                  </p>
                </div>

                {tokenUsage.statistics.mostUsedFeature && (
                  <>
                    <div className="text-center md:col-span-2">
                          <p className="text-sm text-gray-600">
                            Most Used Feature
                          </p>
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
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Token Usage Not Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {subscriptionState === "CANCELLED" ||
                      subscriptionState === "EXPIRED" ||
                      subscriptionState === "TRIAL_ENDED_CANCELLED"
                        ? "Token usage data is not available for cancelled or expired subscriptions."
                        : tokenLoading
                        ? "Loading token usage data..."
                        : "No token usage data available."}
                    </p>
                    {subscriptionState === "CANCELLED" ||
                    subscriptionState === "EXPIRED" ||
                    subscriptionState === "TRIAL_ENDED_CANCELLED" ? (
                <Button
                        onClick={handleRenewSubscription}
                        className="bg-green-600 hover:bg-green-700 text-white"
                >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renew Subscription
                </Button>
                    ) : null}
              </div>
            </CardContent>
          </Card>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
