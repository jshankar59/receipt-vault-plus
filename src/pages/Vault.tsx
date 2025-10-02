import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Search, Filter } from "lucide-react";

interface ReceiptData {
  id: string;
  store_name: string;
  purchase_date: string;
  amount: number;
  category: string;
  warranty_expiry: string | null;
  image_url: string | null;
}

const categories = ["All", "Electronics", "Appliances", "Food & Dining", "Travel", "Health", "Fashion", "Home & Garden", "Others"];

const Vault = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [searchQuery, selectedCategory, receipts]);

  const loadReceipts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("receipts")
      .select("*")
      .order("purchase_date", { ascending: false });
    
    if (data) {
      setReceipts(data);
    }
    setLoading(false);
  };

  const filterReceipts = () => {
    let filtered = receipts;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReceipts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">Receipt Vault</h1>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading receipts...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No receipts found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory !== "All" 
                  ? "Try adjusting your filters" 
                  : "Start by scanning your first receipt"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-[var(--shadow-soft)] transition-shadow">
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
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {receipt.store_name || "Unknown Store"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{receipt.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">
                          ${receipt.amount?.toFixed(2) || "0.00"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(receipt.purchase_date)}
                        </span>
                      </div>
                      {receipt.warranty_expiry && (
                        <p className="text-xs text-accent mt-1">
                          Warranty until {formatDate(receipt.warranty_expiry)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
