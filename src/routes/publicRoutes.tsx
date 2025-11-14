import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "@/pages/signin";
import SignUpPage from "@/pages/signup";
import TeamSignUpPage from "@/pages/signup/team";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import NotFoundPage from "@/pages/not-found";
import AcceptInvitationPage from "@/pages/accept-invitation";

const PublicRoutes = () => {
  return (
    <Router>
      <Routes>
        {["/", "/signin"].map((path) => (
          <Route key={path} path={path} element={<SignInPage />} />
        ))}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/team" element={<TeamSignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default PublicRoutes;
