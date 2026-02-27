import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
