import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';

// Helper to handle simple select queries
const fetchSelect = async (table: string, options: any = {}) => {
  let query = supabase.from(table).select(options.select || '*');
  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      query = query.eq(key, value);
    }
  }
  if (options.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending });
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const data = await fetchSelect('site_settings');
      const settings = data?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      return settings || {};
    },
  });
};

export const useHeroBanners = (activeOnly = true) => {
  return useQuery({
    queryKey: ['heroBanners', activeOnly],
    queryFn: async () => {
      let query = supabase.from('hero_banners').select('*').order('display_order', { ascending: true });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchSelect('categories', { order: { column: 'name', ascending: true } }),
  });
};

export const useProducts = (options?: { isFeatured?: boolean; activeOnly?: boolean; categoryId?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (options?.isFeatured) query = query.eq('is_featured', true);
      if (options?.activeOnly !== false) query = query.eq('is_active', true);
      if (options?.categoryId) {
        query = query.or(`category_id.eq.${options.categoryId},subcategory_id.eq.${options.categoryId}`);
      }
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useReviews = (approvedOnly = true) => {
  return useQuery({
    queryKey: ['reviews', approvedOnly],
    queryFn: async () => {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (approvedOnly) query = query.eq('is_approved', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchSelect('orders', { order: { column: 'created_at', ascending: false } }),
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
