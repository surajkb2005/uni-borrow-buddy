import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemsGrid from "@/components/items/ItemsGrid";
import MyItemsTab from "@/components/items/MyItemsTab";

interface StudentDashboardProps {
  profile: any;
}

const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    fetchMyRequests();
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
    } catch (error) {
      console.error("Error requesting item:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
};

export default StudentDashboard;
