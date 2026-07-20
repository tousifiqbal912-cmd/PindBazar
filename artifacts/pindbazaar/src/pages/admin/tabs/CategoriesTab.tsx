import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2, ArrowRight, FolderOpen, Folder } from 'lucide-react';
import { toast } from 'sonner';

// ── Main Categories ─────────────────────────────────────────────────────────
// Table: categories — id (UUID), name, created_at  (no slug column)

function MainCategoriesPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });

  const resetForm = () => { setEditingId(null); setName(''); };

  const openEdit = (cat: any) => {
    setEditingId(cat.id); setName(cat.name);
    setIsDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name };
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
      setIsDialogOpen(false); resetForm();
    },
    onError: (e: any) => toast.error(e.message || 'Error saving category')
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: any) => {
      if (e.code === '23503') toast.error('Cannot delete: category has products linked to it.');
      else toast.error(e.message || 'Error deleting category');
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <FolderOpen className="w-4 h-4 text-primary" />
          Main Categories
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Category' : 'Add Main Category'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Natural Oils" autoFocus />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>
                {save.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : categories && categories.length > 0 ? categories.map((cat: any) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium text-primary">{cat.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                    if (confirm('Delete this category?')) remove.mutate(cat.id);
                  }}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No categories yet. Add one above.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Subcategories ────────────────────────────────────────────────────────────
// Table: subcategories — id (UUID), category_id (UUID), name, created_at  (no slug)

function SubcategoriesPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });

  const { data: subcategories, isLoading } = useQuery({
    queryKey: ['admin_subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subcategories').select('*, categories(name)').order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });

  const resetForm = () => { setEditingId(null); setName(''); setCategoryId(''); };

  const openEdit = (sub: any) => {
    setEditingId(sub.id); setName(sub.name);
    setCategoryId(sub.category_id || '');
    setIsDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error('Please select a parent category');
      const payload = { name, category_id: categoryId };
      if (editingId) {
        const { error } = await supabase.from('subcategories').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subcategories').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Subcategory updated' : 'Subcategory created');
      queryClient.invalidateQueries({ queryKey: ['admin_subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setIsDialogOpen(false); resetForm();
    },
    onError: (e: any) => toast.error(e.message || 'Error saving subcategory')
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Subcategory deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (e: any) => toast.error(e.message || 'Error deleting subcategory')
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Folder className="w-4 h-4 text-accent" />
          Subcategories
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => resetForm()}><Plus className="w-4 h-4 mr-1" /> Add Subcategory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select parent category" /></SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none__" disabled>No categories yet — add one first</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {(!categories || categories.length === 0) && (
                  <p className="text-xs text-destructive">You need to create at least one main category first.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Subcategory Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cold-Pressed Oils" autoFocus />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim() || !categoryId || categoryId === '__none__'}>
                {save.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Subcategory'}
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
              <TableHead>Parent Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : subcategories && subcategories.length > 0 ? subcategories.map((sub: any) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="flex items-center text-foreground">
                    <ArrowRight className="w-3 h-3 mr-2 text-muted-foreground" />{sub.name}
                  </div>
                </TableCell>
                <TableCell className="text-primary font-medium text-sm">{sub.categories?.name || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                    if (confirm('Delete this subcategory?')) remove.mutate(sub.id);
                  }}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No subcategories yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Combined Export ──────────────────────────────────────────────────────────

export default function CategoriesTab() {
  return (
    <div className="p-6 space-y-10">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Categories</h2>
        <p className="text-muted-foreground text-sm mb-6">Organize your store hierarchy</p>
        <MainCategoriesPanel />
      </div>
      <div>
        <SubcategoriesPanel />
      </div>
    </div>
  );
}
