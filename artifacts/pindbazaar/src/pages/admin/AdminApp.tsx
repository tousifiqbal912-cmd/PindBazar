import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Dashboard from './Dashboard';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function AdminApp() {
  const { isAuthenticated, login } = useAdmin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // Hardcoded credentials as per instructions
    if (data.email === 'tousifiqbal912@gmail.com' && data.password === 'Tousif_Iqbal_baloch@912') {
      login(true);
      toast.success('Logged in successfully');
    } else {
      toast.error('Invalid credentials');
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border p-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-center mb-2">Admin Access</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">Sign in to manage PindBazaar</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login to Dashboard
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
