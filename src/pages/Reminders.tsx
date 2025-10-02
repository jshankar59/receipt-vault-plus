import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Receipt } from "lucide-react";

interface ReceiptData {
  id: string;
  store_name: string;
  purchase_date: string;
  amount: number;
  category: string;
  warranty_expiry: string;
  image_url: string | null;
}

const Reminders = () => {
  const [expiring, setExpiring] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiring();
  }, []);

  const loadExpiring = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from("receipts")
      .select("*")
      .not("warranty_expiry", "is", null)
      .gte("warranty_expiry", new Date().toISOString())
      .order("warranty_expiry", { ascending: true });
    
    if (data) {
      setExpiring(data);
    }
    setLoading(false);
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

  const getUrgencyLevel = (days: number) => {
    if (days <= 7) return "critical";
    if (days <= 30) return "warning";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-lg font-bold">Warranty Reminders</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reminders...</p>
          </div>
        ) : expiring.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No active warranties</h3>
              <p className="text-sm text-muted-foreground">
                Add warranty information when scanning receipts to get reminders
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Critical (7 days or less) */}
            {expiring.filter(r => getDaysUntilExpiry(r.warranty_expiry) <= 7).length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  URGENT - Expiring This Week
                </h2>
                <div className="space-y-3">
                  {expiring
                    .filter(r => getDaysUntilExpiry(r.warranty_expiry) <= 7)
                    .map((receipt) => {
                      const daysLeft = getDaysUntilExpiry(receipt.warranty_expiry);
                      return (
                        <Card key={receipt.id} className="border-destructive/50">
                          <CardContent className="py-4">
                            <div className="flex gap-4">
                              {receipt.image_url ? (
                                <img 
                                  src={receipt.image_url} 
                                  alt="Receipt" 
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center">
                                  <Receipt className="w-8 h-8 text-destructive" />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <h3 className="font-semibold">{receipt.store_name || "Unknown Store"}</h3>
                                <p className="text-sm text-muted-foreground">{receipt.category}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="w-3 h-3 text-destructive" />
                                  <span className="text-xs text-destructive font-semibold">
                                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires {formatDate(receipt.warranty_expiry)}
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

            {/* Warning (8-30 days) */}
            {expiring.filter(r => {
              const days = getDaysUntilExpiry(r.warranty_expiry);
              return days > 7 && days <= 30;
            }).length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Expiring This Month
                </h2>
                <div className="space-y-3">
                  {expiring
                    .filter(r => {
                      const days = getDaysUntilExpiry(r.warranty_expiry);
                      return days > 7 && days <= 30;
                    })
                    .map((receipt) => {
                      const daysLeft = getDaysUntilExpiry(receipt.warranty_expiry);
                      return (
                        <Card key={receipt.id}>
                          <CardContent className="py-4">
                            <div className="flex gap-4">
                              {receipt.image_url ? (
                                <img 
                                  src={receipt.image_url} 
                                  alt="Receipt" 
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                                  <Receipt className="w-8 h-8 text-accent" />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <h3 className="font-semibold">{receipt.store_name || "Unknown Store"}</h3>
                                <p className="text-sm text-muted-foreground">{receipt.category}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="w-3 h-3 text-accent" />
                                  <span className="text-xs text-accent font-semibold">
                                    {daysLeft} days left
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires {formatDate(receipt.warranty_expiry)}
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

            {/* Future (30+ days) */}
            {expiring.filter(r => getDaysUntilExpiry(r.warranty_expiry) > 30).length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Future Warranties
                </h2>
                <div className="space-y-3">
                  {expiring
                    .filter(r => getDaysUntilExpiry(r.warranty_expiry) > 30)
                    .map((receipt) => {
                      const daysLeft = getDaysUntilExpiry(receipt.warranty_expiry);
                      return (
                        <Card key={receipt.id}>
                          <CardContent className="py-4">
                            <div className="flex gap-4">
                              {receipt.image_url ? (
                                <img 
                                  src={receipt.image_url} 
                                  alt="Receipt" 
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                  <Receipt className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <h3 className="font-semibold">{receipt.store_name || "Unknown Store"}</h3>
                                <p className="text-sm text-muted-foreground">{receipt.category}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {daysLeft} days left
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires {formatDate(receipt.warranty_expiry)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
