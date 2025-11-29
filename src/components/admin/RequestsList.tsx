import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface RequestsListProps {
  requests: any[];
  onUpdateRequest: (requestId: string, status: string) => void;
}

const RequestsList = ({ requests, onUpdateRequest }: RequestsListProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-warning text-warning-foreground",
      borrowed: "bg-success text-success-foreground",
      returned: "bg-muted text-muted-foreground",
    };
    
    return (
      <Badge className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{request.profiles?.username}</CardTitle>
                <CardDescription>
                  Student ID: {request.profiles?.student_id}
                </CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{request.items?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Requested: {new Date(request.request_date).toLocaleDateString()}
                </p>
              </div>
              
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateRequest(request.id, "borrowed")}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onUpdateRequest(request.id, "returned")}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              
              {request.status === "borrowed" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onUpdateRequest(request.id, "returned")}
                  className="w-full"
                >
                  Mark as Returned
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RequestsList;
