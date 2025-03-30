
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/database';
import { DataBroker } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Trash, Plus } from "lucide-react";

const DataBrokerManager = () => {
  const [newBroker, setNewBroker] = useState<Omit<DataBroker, 'id'>>({
    name: '',
    optOutUrl: ''
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    optOutUrl?: string;
  }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: brokers, isLoading, isError } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => db.getDataBrokers(),
  });
  
  const addBrokerMutation = useMutation({
    mutationFn: (broker: Omit<DataBroker, 'id'>) => db.addDataBroker(broker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast({ title: "Success", description: "Data broker added successfully" });
      setNewBroker({ name: '', optOutUrl: '' });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add data broker", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteBrokerMutation = useMutation({
    mutationFn: (id: string) => db.deleteDataBroker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast({ title: "Success", description: "Data broker deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete data broker", 
        variant: "destructive" 
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBroker(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const errors: {
      name?: string;
      optOutUrl?: string;
    } = {};
    
    if (!newBroker.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!newBroker.optOutUrl.trim()) {
      errors.optOutUrl = "Opt-out URL is required";
    } else if (!isValidUrl(newBroker.optOutUrl)) {
      errors.optOutUrl = "Please enter a valid URL";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleAddBroker = () => {
    if (validateForm()) {
      addBrokerMutation.mutate(newBroker);
    }
  };
  
  const handleDeleteBroker = (id: string) => {
    if (window.confirm("Are you sure you want to delete this data broker?")) {
      deleteBrokerMutation.mutate(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading brokers...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <p>Error loading data brokers. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Broker Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Broker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Data Broker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Data Broker Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={newBroker.name} 
                  onChange={handleChange} 
                  placeholder="Enter broker name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="optOutUrl">Opt-Out URL</Label>
                <Input 
                  id="optOutUrl" 
                  name="optOutUrl" 
                  value={newBroker.optOutUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/opt-out"
                />
                {formErrors.optOutUrl && (
                  <p className="text-sm text-red-500">{formErrors.optOutUrl}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddBroker} disabled={addBrokerMutation.isPending}>
                {addBrokerMutation.isPending ? "Adding..." : "Add Broker"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Opt-Out URL</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brokers && brokers.length > 0 ? (
              brokers.map((broker) => (
                <TableRow key={broker.id}>
                  <TableCell className="font-medium">{broker.name}</TableCell>
                  <TableCell>
                    <a 
                      href={broker.optOutUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {broker.optOutUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteBroker(broker.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No data brokers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataBrokerManager;
