import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Camera, Archive, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Archive, label: "Vault", path: "/vault" },
    { icon: Bell, label: "Reminders", path: "/reminders" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="border-t border-border bg-card shadow-[var(--shadow-medium)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-3 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Scan Button */}
      <button
        onClick={() => navigate("/scan")}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[var(--shadow-medium)] hover:scale-110 transition-transform flex items-center justify-center z-50"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Camera className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Layout;
