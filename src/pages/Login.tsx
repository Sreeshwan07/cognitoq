import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import cognitoQLogo from "@/assets/cognitoq-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account. After verification, an admin will approve your access.",
      });
      setTab("login");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setLoading(false);
      toast({ title: "Google Sign-In Failed", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: "var(--gradient-primary)" }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center space-y-6"
        >
          <motion.img
            src={cognitoQLogo}
            alt="CognitoQ Logo"
            className="w-36 h-36 mx-auto rounded-2xl object-contain bg-white/90 p-3 shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          <h1 className="text-4xl font-display text-primary-foreground">CognitoQ</h1>
          <p className="text-primary-foreground/70 text-lg">
            AI-Powered Question Paper Setter for Faculty Members
          </p>
          <div className="flex items-center justify-center gap-2 mt-8 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-sm text-primary-foreground/80">Faculty Access Only</span>
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-4">
            <img
              src={cognitoQLogo}
              alt="CognitoQ"
              className="w-20 h-20 rounded-xl object-contain bg-white p-2 shadow-md"
            />
            <span className="font-display text-2xl text-foreground">CognitoQ</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-display text-foreground">Faculty Portal</h2>
            <p className="text-muted-foreground text-sm">Sign in to access the examination system</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="faculty@college.edu" className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-name" placeholder="Dr. Jane Doe" className="pl-10" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="faculty@college.edu" className="pl-10" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="Min 6 characters" className="pl-10" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Faculty Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your account will require admin approval before access is granted.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Access Restricted: Only verified faculty members can use CognitoQ.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
