import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { generateSlug, formatPKR } from '@/utils/helpers';
import { toast } from 'sonner';

export default function ProductsTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [stock, setStock] = useState('100');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin_products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: allSubcategories } = useQuery({
    queryKey: ['admin_subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subcategories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const subCategories = allSubcategories?.filter((s: any) => s.category_id?.toString() === categoryId) || [];

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('pindbazaar').upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('pindbazaar').getPublicUrl(filePath);
      setImages([...images, data.publicUrl]);
      toast.success('Image uploaded');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setSubcategoryId('');
    setStock('100');
    setIsFeatured(false);
    setIsActive(true);
    setImages([]);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name || '');
    setSlug(product.slug || '');
    setDescription(product.description || '');
    setPrice(product.price?.toString() || '');
    setCategoryId(product.category_id?.toString() || '');
    setSubcategoryId(product.subcategory_id?.toString() || '');
    setStock(product.stock?.toString() || '0');
    setIsFeatured(product.is_featured || false);
    setIsActive(product.is_active || false);
    setImages(product.images || []);
    setIsDialogOpen(true);
  };

  const saveProduct = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug,
        description,
        price: parseFloat(price) || 0,
        category_id: categoryId ? parseInt(categoryId) : null,
        subcategory_id: subcategoryId ? parseInt(subcategoryId) : null,
        stock: parseInt(stock) || 0,
        is_featured: isFeatured,
        is_active: isActive,
        images
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
    mutationFn: async (id: number) => {
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Product Name</Label>
                <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Pure Desi Ghee" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="pure-desi-ghee" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Price (PKR)</Label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Main Category</Label>
                <Select value={categoryId} onValueChange={v => { setCategoryId(v); setSubcategoryId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Subcategory (Optional)</Label>
                <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                  <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={stock} onChange={e => setStock(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-4 flex flex-col justify-end pb-2">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="is-featured">Featured Product</Label>
                  <Switch id="is-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="is-active">Active (Visible)</Label>
                  <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              
              <div className="col-span-2 space-y-2 border-t pt-4 mt-2">
                <Label>Product Images (Max 3)</Label>
                <div className="flex gap-4 mb-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded border group overflow-hidden">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <div className="w-20 h-20 rounded border border-dashed flex flex-col items-center justify-center text-muted-foreground relative">
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mb-1" />}
                      <span className="text-[10px]">{isUploading ? 'Uploading...' : 'Upload'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveProduct.mutate()} disabled={saveProduct.isPending || isUploading}>
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
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                  <TableCell>{formatPKR(product.price)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {product.is_active ? <span className="text-xs text-green-600 font-medium">Active</span> : <span className="text-xs text-muted-foreground">Draft</span>}
                      {product.is_featured && <span className="text-[10px] bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded w-max">Featured</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) deleteProduct.mutate(product.id);
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
