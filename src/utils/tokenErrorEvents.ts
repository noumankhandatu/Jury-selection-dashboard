// Event-based system to communicate token errors from Axios interceptor to React components

export interface InsufficientTokensError {
  error: string;
  message: string;
  subscriptionTokensRemaining: number;
  purchasedTokensRemaining: number;
  totalTokensRemaining: number;
  tokensRequired: number;
  resetDate: string;
  feature: string;
  canPurchaseTokens: boolean;
}

const TOKEN_ERROR_EVENT = "insufficient-tokens-error";

// Emit token error event (called from axios interceptor)
export const emitTokenError = (errorData: InsufficientTokensError) => {
  const event = new CustomEvent(TOKEN_ERROR_EVENT, { detail: errorData });
  window.dispatchEvent(event);
};

// Subscribe to token error events (called from React components)
export const subscribeToTokenErrors = (
  callback: (error: InsufficientTokensError) => void
) => {
  const handler = (event: CustomEvent<InsufficientTokensError>) => {
    callback(event.detail);
  };
  window.addEventListener(TOKEN_ERROR_EVENT, handler as EventListener);
  return () => {
    window.removeEventListener(TOKEN_ERROR_EVENT, handler as EventListener);
  };
};

// Check if an error response is an insufficient tokens error
export const isInsufficientTokensError = (error: any): boolean => {
  return (
    error?.response?.data?.error === "Insufficient AI tokens" ||
    error?.response?.data?.canPurchaseTokens === true
  );
};

// Extract token error data from axios error
export const extractTokenErrorData = (error: any): InsufficientTokensError | null => {
  if (!isInsufficientTokensError(error)) {
    return null;
  }
  return error.response.data as InsufficientTokensError;
};
