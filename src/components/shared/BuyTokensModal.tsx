import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Zap,
  AlertTriangle,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { useTokenPack, InsufficientTokensError } from "@/contexts/TokenPackContext";
import {
  getTokenPacksApi,
  createTokenPackCheckoutApi,
} from "@/api/api";

// Re-export for use by other components
export type { InsufficientTokensError };

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  tokensFormatted: string;
  price: number;
  priceFormatted: string;
}

const BuyTokensModal = () => {
  const { isModalOpen, tokenError, closeBuyTokensModal } = useTokenPack();
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      fetchTokenPacks();
    }
  }, [isModalOpen]);

  const fetchTokenPacks = async () => {
    try {
      setLoading(true);
      const response = await getTokenPacksApi();
      setPacks(response.packs || []);
    } catch (error: any) {
      console.error("Error fetching token packs:", error);
      toast.error("Failed to load token packs");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    const organizationId = localStorage.getItem("organizationId");
    if (!organizationId) {
      toast.error("Organization not found");
      return;
    }

    try {
      setPurchasingPackId(packId);
      const response = await createTokenPackCheckoutApi({
        packId,
        organizationId,
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to start checkout";
      toast.error(errorMsg);
    } finally {
      setPurchasingPackId(null);
    }
  };

  const formatFeatureName = (feature: string) => {
    const featureNames: Record<string, string> = {
      question_generation: "AI Question Generation",
      juror_analysis: "Juror Analysis",
      response_assessment: "Response Assessment",
      strike_recommendation: "Strike Recommendations",
      pdf_extraction: "PDF Extraction",
    };
    return featureNames[feature] || feature.replace(/_/g, " ");
  };

  const getRecommendedPack = () => {
    if (!tokenError) return null;
    const requiredTokens = tokenError.tokensRequired;
    // Recommend the smallest pack that covers the required tokens
    const recommended = packs.find((pack) => pack.tokens >= requiredTokens);
    return recommended?.id || packs[packs.length - 1]?.id;
  };

  const recommendedPackId = getRecommendedPack();

  return (
    <Dialog open={isModalOpen} onOpenChange={closeBuyTokensModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coins className="w-6 h-6 text-amber-500" />
            Buy More AI Tokens
          </DialogTitle>
          <DialogDescription>
            Purchase additional tokens to continue using AI features
          </DialogDescription>
        </DialogHeader>

        {/* Error Info Banner */}
        {tokenError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800">
                  Insufficient tokens for {formatFeatureName(tokenError.feature)}
                </p>
                <p className="text-sm text-amber-700">
                  {tokenError.message}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    Required: {tokenError.tokensRequired.toLocaleString()} tokens
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    Available: {tokenError.totalTokensRemaining.toLocaleString()} tokens
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Packs Grid */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select a Token Pack
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packs.map((pack) => {
                const isRecommended = pack.id === recommendedPackId;
                const isPurchasing = purchasingPackId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                      isRecommended
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isRecommended && (
                      <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-gray-900">
                            {pack.tokensFormatted}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {pack.priceFormatted}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{pack.name}</p>

                      <div className="text-xs text-gray-500">
                        {(pack.price / (pack.tokens / 1000)).toFixed(2)}$ per 1K tokens
                      </div>

                      <Button
                        onClick={() => handlePurchase(pack.id)}
                        disabled={!!purchasingPackId}
                        className={`w-full ${
                          isRecommended
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Buy {pack.tokensFormatted}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Coins className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Purchased tokens never expire and are used after your monthly
              subscription tokens are depleted. You'll be redirected to our
              secure payment partner Stripe to complete your purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyTokensModal;
