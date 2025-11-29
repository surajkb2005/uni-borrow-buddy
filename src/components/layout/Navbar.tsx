import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavbarProps {
  username?: string;
  role?: string;
}

const Navbar = ({ username, role }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CampusLend</h1>
              {role && (
                <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {username && (
              <span className="text-sm text-muted-foreground">Hello, {username}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
