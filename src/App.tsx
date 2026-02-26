import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import SubjectLibrary from "./pages/SubjectLibrary";
import QuestionBank from "./pages/QuestionBank";
import GeneratePaper from "./pages/GeneratePaper";
import Blueprints from "./pages/Blueprints";
import Analytics from "./pages/Analytics";
import PastPapers from "./pages/PastPapers";
import PreviousYearPapers from "./pages/PreviousYearPapers";
import SettingsPage from "./pages/Settings";
import UploadPaper from "./pages/UploadPaper";
import SavedPapers from "./pages/SavedPapers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectLibrary />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/generate" element={<GeneratePaper />} />
        <Route path="/blueprints" element={<Blueprints />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/papers" element={<PastPapers />} />
        <Route path="/pyq" element={<PreviousYearPapers />} />
        <Route path="/upload" element={<UploadPaper />} />
        <Route path="/saved" element={<SavedPapers />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function AuthPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

export default App;
