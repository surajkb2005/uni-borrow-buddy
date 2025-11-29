import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Plus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // No automatic redirect, let user browse the landing page
      }
    };
    checkSession();
  }, []);

  const handleAuthAction = (path: string) => {
    navigate(path);
  };

  const handlePostItemClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CampusLend</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => handleAuthAction("/login")}>
              Sign In
            </Button>
            <Button onClick={() => handleAuthAction("/register")}>
              Get Started
            </Button>
          </div>
        </nav>

        <div className="py-20 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Borrow What You Need,
              <br />
              <span className="text-primary">Share What You Have</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with college clubs across campus to borrow equipment, instruments, 
              and more. Everything you need, right at your fingertips.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => handleAuthAction("/register")}>
              Join CampusLend
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handlePostItemClick}>
                <Plus className="mr-2 h-5 w-5" />
                Post an Item
            </Button>
          </div>

          <div className="pt-10 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="text-sm" onClick={() => handleAuthAction("/login")}>
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Equipment</h3>
              <p className="text-muted-foreground">
                Explore items from various clubs including cameras, instruments, sports gear, and more.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Borrowing</h3>
              <p className="text-muted-foreground">
                Request items with a single click. Track your active loans and pending requests.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Club Management</h3>
              <p className="text-muted-foreground">
                Club admins can easily manage inventory and approve borrow requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
