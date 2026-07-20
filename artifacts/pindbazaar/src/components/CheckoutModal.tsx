import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/context/CartContext';
import { useCreateOrder } from '@/hooks/use-queries';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete delivery address is required"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const CheckoutModal = ({ isOpen, setIsOpen }: CheckoutModalProps) => {
  const { cart, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [orderComplete, setOrderComplete] = React.useState(false);
  const [orderId, setOrderId] = React.useState<number | null>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  const onSubmit = (data: CheckoutValues) => {
    if (cart.length === 0) return;

    createOrder.mutate(
      {
        customer_name: data.fullName,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        items: cart,
        total: total,
        status: 'pending',
      },
      {
        onSuccess: (res) => {
          setOrderId(res.id);
          setOrderComplete(true);
          clearCart();
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        },
      }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      if (orderComplete) {
        setOrderComplete(false);
        form.reset();
      }
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {orderComplete ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <DialogTitle className="text-2xl font-serif text-primary mb-2">Order Confirmed!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Thank you for choosing PindBazaar. Your order has been placed successfully.
            </DialogDescription>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-lg font-bold">#{orderId}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We will contact you shortly to confirm your delivery via Cash on Delivery.
            </p>
            <Button onClick={() => handleClose(false)} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">Checkout Details</DialogTitle>
              <DialogDescription>
                Please enter your shipping details for Cash on Delivery.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ali Khan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0300 1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complete Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="House 123, Street 4, Phase 5..." className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Any specific instructions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 border-t mt-6">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={createOrder.isPending}>
                    {createOrder.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      'Place Order (Cash on Delivery)'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
