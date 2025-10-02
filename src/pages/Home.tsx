import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Bell, LogOut, Camera, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReceiptData {
  id: string;
  store_name: string;
  purchase_date: string;
  amount: number;
  category: string;
  warranty_expiry: string | null;
}

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [recentReceipts, setRecentReceipts] = useState<ReceiptData[]>([]);
  const [upcomingExpiries, setUpcomingExpiries] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        loadData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    
    // Load recent receipts
    const { data: receipts } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    
    if (receipts) setRecentReceipts(receipts);

    // Load upcoming warranty expiries (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: expiring } = await supabase
      .from("receipts")
      .select("*")
      .not("warranty_expiry", "is", null)
      .gte("warranty_expiry", new Date().toISOString())
      .lte("warranty_expiry", thirtyDaysFromNow.toISOString())
      .order("warranty_expiry", { ascending: true });
    
    if (expiring) setUpcomingExpiries(expiring);
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AutoBill Vault</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentReceipts.length}</p>
                  <p className="text-xs text-muted-foreground">Recent Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingExpiries.length}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan CTA */}
        <Card 
          className="cursor-pointer hover:shadow-[var(--shadow-medium)] transition-shadow"
          onClick={() => navigate("/scan")}
          style={{ background: "var(--gradient-card)" }}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Scan New Bill</h3>
              <p className="text-sm text-muted-foreground">Add a receipt in seconds</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardContent>
        </Card>

        {/* Upcoming Expiries */}
        {upcomingExpiries.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Warranty Expiring Soon
            </h2>
            <div className="space-y-3">
              {upcomingExpiries.map((receipt) => {
                const daysLeft = getDaysUntilExpiry(receipt.warranty_expiry!);
                return (
                  <Card key={receipt.id} className="hover:shadow-[var(--shadow-soft)] transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{receipt.store_name || "Unknown Store"}</h3>
                          <p className="text-sm text-muted-foreground">{receipt.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${daysLeft <= 7 ? 'text-destructive' : 'text-accent'}`}>
                            {daysLeft} days left
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(receipt.warranty_expiry!)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Receipts */}
        {recentReceipts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Recent Bills
            </h2>
            <div className="space-y-3">
              {recentReceipts.map((receipt) => (
                <Card key={receipt.id} className="hover:shadow-[var(--shadow-soft)] transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{receipt.store_name || "Unknown Store"}</h3>
                        <p className="text-sm text-muted-foreground">{receipt.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${receipt.amount?.toFixed(2) || "0.00"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(receipt.purchase_date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && recentReceipts.length === 0 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>No receipts yet</CardTitle>
              <CardDescription>Tap the camera button to scan your first bill!</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
