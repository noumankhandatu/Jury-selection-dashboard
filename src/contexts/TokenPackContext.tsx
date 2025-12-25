import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { subscribeToTokenErrors, InsufficientTokensError } from "@/utils/tokenErrorEvents";

export type { InsufficientTokensError };

interface TokenPackContextType {
  isModalOpen: boolean;
  tokenError: InsufficientTokensError | null;
  openBuyTokensModal: (error?: InsufficientTokensError) => void;
  closeBuyTokensModal: () => void;
}

const TokenPackContext = createContext<TokenPackContextType | undefined>(undefined);

export const TokenPackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenError, setTokenError] = useState<InsufficientTokensError | null>(null);

  const openBuyTokensModal = useCallback((error?: InsufficientTokensError) => {
    if (error) {
      setTokenError(error);
    }
    setIsModalOpen(true);
  }, []);

  const closeBuyTokensModal = useCallback(() => {
    setIsModalOpen(false);
    setTokenError(null);
  }, []);

  // Listen for token error events from axios interceptor
  useEffect(() => {
    const unsubscribe = subscribeToTokenErrors((error) => {
      openBuyTokensModal(error);
    });
    return unsubscribe;
  }, [openBuyTokensModal]);

  return (
    <TokenPackContext.Provider
      value={{
        isModalOpen,
        tokenError,
        openBuyTokensModal,
        closeBuyTokensModal,
      }}
    >
      {children}
    </TokenPackContext.Provider>
  );
};

export const useTokenPack = () => {
  const context = useContext(TokenPackContext);
  if (context === undefined) {
    throw new Error("useTokenPack must be used within a TokenPackProvider");
  }
  return context;
};
