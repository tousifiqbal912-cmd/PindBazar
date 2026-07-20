import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { generateSlug } from '@/utils/helpers';
import { toast } from 'sonner';

export default function CategoriesTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('none');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('parent_id', { ascending: true }).order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const mainCategories = categories?.filter(c => !c.parent_id) || [];

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setParentId('none');
  };

  const openEdit = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id?.toString() || 'none');
    setIsDialogOpen(true);
  };

  const saveCategory = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug,
        parent_id: parentId === 'none' ? null : parseInt(parentId)
      };

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Error saving category')
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      if (error.code === '23503') {
        toast.error('Cannot delete: this category is being used by products or subcategories.');
      } else {
        toast.error(error.message || 'Error deleting category');
      }
    }
  });

  // Organize for display
  const displayList = mainCategories.map(main => ({
    ...main,
    subcategories: categories?.filter(c => c.parent_id === main.id) || []
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground text-sm">Organize your store hierarchy</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Natural Oils" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="natural-oils" />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger><SelectValue placeholder="Top Level (No Parent)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Top Level (Main Category)</SelectItem>
                    {mainCategories.filter(c => c.id !== editingId).map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select a parent if this is a subcategory.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveCategory.mutate()} disabled={saveCategory.isPending}>
                {saveCategory.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : displayList && displayList.length > 0 ? (
              displayList.flatMap((main) => [
                <TableRow key={main.id} className="bg-muted/20">
                  <TableCell className="font-bold text-primary">{main.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{main.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(main)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      if (confirm('Delete this main category?')) deleteCategory.mutate(main.id);
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>,
                ...main.subcategories.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="pl-10">
                      <div className="flex items-center text-muted-foreground">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        <span className="text-foreground">{sub.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{sub.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        if (confirm('Delete this subcategory?')) deleteCategory.mutate(sub.id);
                      }}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ])
            ) : (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
