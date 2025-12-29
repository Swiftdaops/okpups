import { useEffect } from 'react';
import { create } from 'zustand';

const persistKey = 'okpups_cart_v1';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items.slice();
    const idx = items.findIndex((x) => x._id === item._id && x._type === item._type);
    if (idx >= 0) items[idx].qty += item.qty || 1; else items.push({ ...item, qty: item.qty || 1 });
    set({ items });
  },
  removeItem: (id, type) => set({ items: get().items.filter((x) => !(x._id === id && x._type === type)) }),
  clear: () => set({ items: [] }),
  load: () => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) set({ items: JSON.parse(raw) || [] });
    } catch {}
  },
}));

export function useCartPersistence() {
  const { items, load } = useCartStore();
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    try { localStorage.setItem(persistKey, JSON.stringify(items)); } catch {}
  }, [items]);
}
