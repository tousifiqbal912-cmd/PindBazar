import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
    }
  });

  const form = useForm({
    defaultValues: {
      whatsapp_number: '',
      contact_email: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: ''
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        whatsapp_number: settings.whatsapp_number || '',
        contact_email: settings.contact_email || '',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        twitter_url: settings.twitter_url || ''
      });
    }
  }, [settings, form]);

  const saveSettings = useMutation({
    mutationFn: async (data: any) => {
      const entries = Object.entries(data).map(([key, value]) => ({
        key,
        value: value as string
      }));

      for (const entry of entries) {
        // Upsert logic for each setting
        const { error } = await supabase
          .from('site_settings')
          .upsert(entry, { onConflict: 'key' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin_settings'] });
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    },
    onError: (error: any) => toast.error(error.message || 'Error updating settings')
  });

  const onSubmit = (data: any) => {
    saveSettings.mutate(data);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-foreground">Site Settings</h2>
        <p className="text-muted-foreground text-sm">Update contact info and social links displayed across the site.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h3 className="font-serif text-xl font-bold border-b pb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
                    </FormControl>
                    <FormDescription>Used for the floating chat button and contact page.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="support@pindbazaar.com" type="email" {...field} />
                    </FormControl>
                    <FormDescription>Displayed on the contact page.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h3 className="font-serif text-xl font-bold border-b pb-4">Social Media Links</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/pindbazaar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/pindbazaar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter / X URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/pindbazaar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg" disabled={saveSettings.isPending}>
              {saveSettings.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Save All Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
