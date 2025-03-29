
import React, { useState } from 'react';
import { DataRequest } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

interface RequestListProps {
  requests: DataRequest[];
  onUpdateRequest: (id: string, updates: Partial<DataRequest>) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onUpdateRequest }) => {
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);

  const getStatusBadge = (status: DataRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'responded':
        return <Badge variant="default">Responded</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Broker</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.brokerName}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{formatDate(request.dateCreated)}</TableCell>
              <TableCell>{formatDate(request.dateUpdated)}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRequest(request)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                Details for request to {selectedRequest.brokerName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <div className="col-span-3">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Created:</span>
                <div className="col-span-3">{formatDate(selectedRequest.dateCreated)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Updated:</span>
                <div className="col-span-3">{formatDate(selectedRequest.dateUpdated)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Email:</span>
                <div className="col-span-3">{selectedRequest.userEmail}</div>
              </div>
              
              {selectedRequest.responseContent && (
                <div className="grid grid-cols-4 gap-4">
                  <span className="text-sm font-medium">Response:</span>
                  <div className="col-span-3 p-3 bg-muted rounded-md text-sm">
                    {selectedRequest.responseContent}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-4">
                {selectedRequest.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      onUpdateRequest(selectedRequest.id, { status: 'sent' });
                      setSelectedRequest(null);
                    }}
                  >
                    Mark as Sent
                  </Button>
                )}
                
                {selectedRequest.status === 'sent' && (
                  <Button 
                    onClick={() => {
                      onUpdateRequest(selectedRequest.id, { 
                        status: 'responded',
                        responseContent: 'Automated response: Your request is being processed.'
                      });
                      setSelectedRequest(null);
                    }}
                  >
                    Simulate Response
                  </Button>
                )}
                
                {selectedRequest.status === 'responded' && (
                  <Button 
                    onClick={() => {
                      onUpdateRequest(selectedRequest.id, { status: 'completed' });
                      setSelectedRequest(null);
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default RequestList;
