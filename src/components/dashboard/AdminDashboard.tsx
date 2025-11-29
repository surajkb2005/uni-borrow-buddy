import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ItemsGrid from "@/components/items/ItemsGrid";
import RequestsList from "@/components/admin/RequestsList";
import AddItemDialog from "@/components/admin/AddItemDialog";
import { toast } from "sonner";

interface AdminDashboardProps {
  profile: any;
}

const AdminDashboard = ({ profile }: AdminDashboardProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchClubAndItems();
  }, [profile]);

  useEffect(() => {
    if (club) {
      fetchRequests();
    }
  }, [club]);

  const fetchClubAndItems = async () => {
    setLoading(true);
    try {
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("admin_id", profile.id)
        .single();

      if (clubError && clubError.code !== "PGRST116") throw clubError;
      
      setClub(clubData);

      if (clubData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .eq("club_id", clubData.id)
          .order("created_at", { ascending: false });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      }
    } catch (error) {
      console.error("Error fetching club/items:", error);
      toast.error("Failed to fetch club data and items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!club) return;

    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          profiles (
            username,
            student_id
          ),
          items (
            id,
            name,
            club_id
          )
        `)
        // This is a bit tricky, we need to filter requests where the item's club_id matches our admin's club
        // .eq("items.club_id", club.id) -> This doesn't work directly on nested properties.
        // We'll fetch requests and then filter, or do a more complex query if needed.
        .order("request_date", { ascending: false });

      if (error) throw error;
      
      // Manual filter since direct query is complex
      const filteredRequests = data?.filter(r => r.items?.club_id === club.id) || [];
      setRequests(filteredRequests);

    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch item requests.");
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const { error } = await supabase.from("items").insert({
        ...itemData,
      });

      if (error) throw error;
      toast.success("Item added successfully");
      fetchClubAndItems(); // Refetch items
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const handleUpdateRequest = async (requestId: string, newStatus: "available" | "borrowed" | "maintenance" | "pending") => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;
      
      toast.success(`Request status updated to ${newStatus}`);
      fetchRequests(); // Refetch requests
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request status");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center bg-card p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">No Club Associated</h2>
          <p className="text-muted-foreground">
            You are not currently an admin of any club. Please contact support if this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{club.name}</h2>
          <p className="text-muted-foreground">{club.description}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requests.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <ItemsGrid items={items} loading={loading} isAdmin />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsList 
            requests={requests} 
            onUpdateRequest={handleUpdateRequest}
          />
        </TabsContent>
      </Tabs>

      <AddItemDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddItem={handleAddItem}
        defaultClubId={club.id}
      />
    </div>
  );
};

export default AdminDashboard;
