import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { formatPKR } from '@/utils/helpers';
import { toast } from 'sonner';

// Table: products — id (UUID), name, description, price, category_id (UUID),
//                   subcategory_id (UUID), images (TEXT[]), created_at
// NOTE: No slug, no is_active, no is_featured, no stock columns.

export default function ProductsTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state — only columns that actually exist
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) return [];
      return data ?? [];
    }
  });

  const { data: allSubcategories } = useQuery({
    queryKey: ['admin_subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subcategories').select('*').order('name', { ascending: true });
      if (error) return [];
      return data ?? [];
    }
  });

  // Filter subcategories by selected category (UUIDs — no parseInt)
  const subCategories = (allSubcategories ?? []).filter(
    (s: any) => s.category_id === categoryId
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 3) { toast.error('Maximum 3 images allowed'); return; }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('pindbazaar').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('pindbazaar').getPublicUrl(filePath);
      setImages(prev => [...prev, data.publicUrl]);
      toast.success('Image uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setDescription(''); setPrice('');
    setCategoryId(''); setSubcategoryId(''); setImages([]);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price?.toString() || '');
    setCategoryId(product.category_id || '');
    setSubcategoryId(product.subcategory_id || '');
    setImages(product.images || []);
    setIsDialogOpen(true);
  };

  const saveProduct = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Product name is required');
      if (!price) throw new Error('Price is required');

      // Only send columns that exist in the actual table
      const payload: any = {
        name,
        description: description || null,
        price: parseFloat(price),
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        images,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Error saving product')
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => toast.error(error.message || 'Error deleting product')
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground text-sm">Manage your catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Name */}
              <div className="col-span-2 space-y-2">
                <Label>Product Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pure Desi Ghee 1kg" autoFocus />
              </div>
              {/* Description */}
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the product..." />
              </div>
              {/* Price */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Price (PKR) *</Label>
                <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" />
              </div>
              {/* Category */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Main Category</Label>
                <Select value={categoryId} onValueChange={v => { setCategoryId(v); setSubcategoryId(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none__" disabled>No categories — add one in Categories tab</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Subcategory */}
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Subcategory <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId || subCategories.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={!categoryId ? 'Select category first' : subCategories.length === 0 ? 'No subcategories' : 'Select Subcategory'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subCategories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="col-span-2 space-y-2 border-t pt-4 mt-2">
                <Label>Product Images <span className="text-muted-foreground text-xs">(max 3)</span></Label>
                <div className="flex flex-wrap gap-3">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg border group overflow-hidden">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <div className="w-20 h-20 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground relative hover:border-primary transition-colors">
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mb-1" />}
                      <span className="text-[10px]">{isUploading ? 'Uploading…' : 'Upload'}</span>
                      <input
                        type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveProduct.mutate()} disabled={saveProduct.isPending || isUploading || !name.trim() || !price}>
                {saveProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : products && products.length > 0 ? (
              products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{(product as any).categories?.name || 'Uncategorized'}</TableCell>
                  <TableCell className="font-semibold text-primary">{formatPKR(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm('Delete this product?')) deleteProduct.mutate(product.id);
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No products yet. Add your first product above.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
