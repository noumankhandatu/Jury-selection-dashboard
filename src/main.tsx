import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { TokenPackProvider } from "./contexts/TokenPackContext";
import BuyTokensModal from "./components/shared/BuyTokensModal";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TokenPackProvider>
      <App />
      <BuyTokensModal />
      <Toaster expand={false} position="top-right" richColors />
    </TokenPackProvider>
  </StrictMode>
);
