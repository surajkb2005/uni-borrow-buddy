import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MyItemsTabProps {
  requests: any[];
}

const MyItemsTab = ({ requests }: MyItemsTabProps) => {
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

  const activeRequests = requests.filter(r => r.status === "borrowed");
  const pendingRequests = requests.filter(r => r.status === "pending");
  const historyRequests = requests.filter(r => r.status === "returned");

  const RequestCard = ({ request }: { request: any }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{request.items?.name}</CardTitle>
            <CardDescription>
              {request.items?.clubs?.name}
            </CardDescription>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Requested: {new Date(request.request_date).toLocaleDateString()}</p>
          {request.return_due_date && (
            <p>Due: {new Date(request.return_due_date).toLocaleDateString()}</p>
          )}
          {request.actual_return_date && (
            <p>Returned: {new Date(request.actual_return_date).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">
          Active ({activeRequests.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingRequests.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          History ({historyRequests.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="space-y-4">
        {activeRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active loans</p>
        ) : (
          activeRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>
      
      <TabsContent value="pending" className="space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending requests</p>
        ) : (
          pendingRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        {historyRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No history yet</p>
        ) : (
          historyRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default MyItemsTab;
