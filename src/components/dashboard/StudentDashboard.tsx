import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemsGrid from "@/components/items/ItemsGrid";
import MyItemsTab from "@/components/items/MyItemsTab";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddItemDialog from "@/components/admin/AddItemDialog";
import { toast } from "sonner";

interface StudentDashboardProps {
  profile: any;
}

const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
    fetchMyRequests();
    fetchAllClubs();
  }, [profile]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select(`
          *,
          clubs (
            id,
            name
          )
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          items (
            id,
            name,
            image_url,
            clubs (
              name
            )
          )
        `)
        .eq("user_id", profile.id)
        .order("request_date", { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const { data, error } = await supabase.from("clubs").select("*");
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleRequestItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("requests").insert({
        user_id: profile.id,
        item_id: itemId,
        status: "pending",
      });

      if (error) throw error;
      fetchItems();
      fetchMyRequests();
      toast.success("Item requested successfully");
    } catch (error) {
      console.error("Error requesting item:", error);
      toast.error("Failed to request item");
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const { error } = await supabase.from("items").insert({
        ...itemData,
      });

      if (error) throw error;
      toast.success("Item added successfully! It will be reviewed by an admin.");
      fetchItems();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Dashboard</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post Item
        </Button>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="browse">Browse Items</TabsTrigger>
          <TabsTrigger value="my-items">My Items</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <ItemsGrid 
            items={items} 
            loading={loading} 
            onRequestItem={handleRequestItem}
          />
        </TabsContent>
        <TabsContent value="my-items">
          <MyItemsTab requests={myRequests} />
        </TabsContent>
      </Tabs>

      <AddItemDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddItem={handleAddItem}
        clubs={clubs}
      />
    </div>
  );
};

export default StudentDashboard;
