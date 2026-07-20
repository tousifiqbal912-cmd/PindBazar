import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';

// ── Site Settings ────────────────────────────────────────────────────────────
// Table: site_settings — single row (id=1) with named columns
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (error) return {};
      return data || {};
    },
    retry: false,
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('site_settings').update(payload).eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['siteSettings'] }),
  });
};

// ── Hero Banners ─────────────────────────────────────────────────────────────
// Table: hero_banners — id (UUID), title, subtitle, image_url, created_at
export const useHeroBanners = () => {
  return useQuery({
    queryKey: ['heroBanners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_banners').select('*').order('created_at', { ascending: true });
      if (error) return [];
      return data ?? [];
    },
    retry: false,
  });
};

// ── Categories ───────────────────────────────────────────────────────────────
// Table: categories — id (UUID), name, created_at
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) return [];
      return data ?? [];
    },
    retry: false,
  });
};

// ── Subcategories ─────────────────────────────────────────────────────────────
// Table: subcategories — id (UUID), category_id (UUID), name, created_at
export const useSubcategories = (categoryId?: string) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      let query = supabase.from('subcategories').select('*').order('name', { ascending: true });
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error } = await query;
      if (error) return [];
      return data ?? [];
    },
    retry: false,
  });
};

// ── Products ─────────────────────────────────────────────────────────────────
// Table: products — id (UUID), name, description, price, category_id (UUID),
//                   subcategory_id (UUID), images (TEXT[]), created_at
export const useProducts = (options?: { categoryId?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
      if (options?.categoryId) query = query.eq('category_id', options.categoryId);
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) return [];
      return data ?? [];
    },
    retry: false,
  });
};

// Fetch a single product by id
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, categories(name), subcategories(name)').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false,
  });
};

// ── Orders ────────────────────────────────────────────────────────────────────
// Table: orders — id, customer_name, customer_phone, customer_address, items (JSONB),
//                 total_price, status, created_at
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    retry: false,
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
      if (error) throw error;
      return data;
    },
  });
};
