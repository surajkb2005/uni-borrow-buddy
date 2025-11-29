import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ItemsGridProps {
  items: any[];
  loading: boolean;
  onRequestItem?: (itemId: string) => void;
  isAdmin?: boolean;
}

const ItemsGrid = ({ items, loading, onRequestItem, isAdmin = false }: ItemsGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted"></div>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items available</p>
      </div>
    );
  }

  const handleRequest = (itemId: string) => {
    if (onRequestItem) {
      onRequestItem(itemId);
      toast.success("Request submitted!");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: "bg-success text-success-foreground",
      borrowed: "bg-warning text-warning-foreground",
      maintenance: "bg-destructive text-destructive-foreground",
      pending: "bg-muted text-muted-foreground",
    };
    
    return (
      <Badge className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-muted relative overflow-hidden">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-1">{item.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {item.clubs?.name || "Unknown Club"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
            <div className="flex items-center gap-2">
              {getStatusBadge(item.status)}
              {item.category && (
                <Badge variant="outline">{item.category}</Badge>
              )}
            </div>
          </CardContent>
          {!isAdmin && item.status === "available" && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleRequest(item.id)}
              >
                Request to Borrow
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ItemsGrid;
