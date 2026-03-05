import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import SubjectLibrary from "./pages/SubjectLibrary";
import QuestionBank from "./pages/QuestionBank";
import GeneratePaper from "./pages/GeneratePaper";
import UploadPaper from "./pages/UploadPaper";
import SavedPapers from "./pages/SavedPapers";
import PreviousYearPapers from "./pages/PreviousYearPapers";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import GenerateFromNotes from "./pages/GenerateFromNotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/subjects" element={<SubjectLibrary />} />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/generate" element={<GeneratePaper />} />
              <Route path="/generate-from-notes" element={<GenerateFromNotes />} />
              <Route path="/upload" element={<UploadPaper />} />
              <Route path="/saved" element={<SavedPapers />} />
              <Route path="/pyq" element={<PreviousYearPapers />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
