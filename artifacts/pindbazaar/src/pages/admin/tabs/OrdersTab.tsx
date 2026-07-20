import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPKR } from '@/utils/helpers';
import { Loader2, Eye, MapPin, Phone, User, Calendar, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersTab() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
    },
    onError: (error: any) => toast.error(error.message || 'Error updating status')
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground">Orders</h2>
        <p className="text-muted-foreground text-sm">Manage customer orders and status</p>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">#{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customer_name}</span>
                      <span className="text-xs text-muted-foreground">{order.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{formatPKR(order.total)}</TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val })}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs border ${getStatusColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-serif">Order #{selectedOrder.id}</DialogTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-xl border">
                    <h3 className="font-bold mb-3 flex items-center"><User className="w-4 h-4 mr-2" /> Customer Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span>{selectedOrder.customer_name}</span></div>
                      <div className="flex justify-between items-center"><span className="text-muted-foreground">Phone:</span> <a href={`tel:${selectedOrder.phone}`} className="text-primary hover:underline flex items-center"><Phone className="w-3 h-3 mr-1" /> {selectedOrder.phone}</a></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Date:</span> <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-xl border">
                    <h3 className="font-bold mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Delivery Address</h3>
                    <p className="text-sm whitespace-pre-line">{selectedOrder.address}</p>
                    {selectedOrder.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Order Notes:</span>
                        <p className="text-sm mt-1 bg-yellow-50 text-yellow-900 p-2 rounded">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card p-0 rounded-xl border overflow-hidden flex flex-col">
                  <div className="p-4 bg-muted/50 border-b">
                    <h3 className="font-bold flex items-center"><Receipt className="w-4 h-4 mr-2" /> Order Items</h3>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0 border">
                          {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} x {formatPKR(item.price)}</p>
                        </div>
                        <div className="font-bold text-sm">
                          {formatPKR(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center text-lg">
                    <span className="font-serif">Total (COD)</span>
                    <span className="font-bold">{formatPKR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
