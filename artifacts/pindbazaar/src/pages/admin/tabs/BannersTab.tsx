import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BannersTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin_banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('pindbazaar').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('pindbazaar').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      toast.success('Banner image uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setIsActive(true);
  };

  const openEdit = (banner: any) => {
    setEditingId(banner.id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.image_url || '');
    setIsActive(banner.is_active);
    setIsDialogOpen(true);
  };

  const saveBanner = useMutation({
    mutationFn: async () => {
      if (!imageUrl) throw new Error("Image is required");
      
      const payload = {
        title,
        subtitle,
        image_url: imageUrl,
        is_active: isActive
      };

      if (editingId) {
        const { error } = await supabase.from('hero_banners').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_banners').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Banner updated' : 'Banner created');
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      queryClient.invalidateQueries({ queryKey: ['heroBanners'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Error saving banner')
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('hero_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      queryClient.invalidateQueries({ queryKey: ['heroBanners'] });
    },
    onError: (error: any) => toast.error(error.message || 'Error deleting banner')
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Hero Banners</h2>
          <p className="text-muted-foreground text-sm">Manage the homepage slider images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Banner Image (Recommended 1920x800)</Label>
                {imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border bg-muted group aspect-[21/9]">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button variant="outline" size="sm" className="relative text-white border-white bg-transparent hover:bg-white/20">
                        <Upload className="w-4 h-4 mr-2" /> Change Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground aspect-[21/9] bg-muted/50 relative">
                    {isUploading ? (
                      <><Loader2 className="w-8 h-8 animate-spin mb-2" /> Uploading...</>
                    ) : (
                      <><Upload className="w-8 h-8 mb-2" /> Click to upload image</>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Title (Optional)</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Main headline text" />
              </div>
              <div className="space-y-2">
                <Label>Subtitle (Optional)</Label>
                <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Smaller text below headline" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="banner-active">Active (Visible)</Label>
                <Switch id="banner-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveBanner.mutate()} disabled={saveBanner.isPending || isUploading || !imageUrl}>
                {saveBanner.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Banner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : banners && banners.length > 0 ? (
          banners.map((banner) => (
            <div key={banner.id} className="flex items-center gap-6 p-4 rounded-xl border bg-card">
              <div className="w-48 aspect-[21/9] rounded overflow-hidden shrink-0 border bg-muted">
                <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-lg truncate">{banner.title || 'Untitled Banner'}</h4>
                <p className="text-sm text-muted-foreground truncate">{banner.subtitle || 'No subtitle'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${banner.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {banner.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => openEdit(banner)}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                  if (confirm('Delete this banner?')) deleteBanner.mutate(banner.id);
                }}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/30 text-muted-foreground">
            No banners found. Add one to show on the homepage.
          </div>
        )}
      </div>
    </div>
  );
}
