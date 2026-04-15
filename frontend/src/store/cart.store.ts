// src/store/cart.store.ts
import { create } from 'zustand';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
  product: {
    id: string; name: string; price: number; stock: number;
    images: { url: string; alt: string }[];
    slug: string;
  };
}

interface CartState {
  items:     CartItem[];
  subtotal:  number;
  isOpen:    boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem:   (productId: string, quantity?: number, variantId?: string, productName?: string) => Promise<void>;
  updateItem:(itemId: string, quantity: number) => Promise<void>;
  removeItem:(itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart:() => void;
  openCart:  () => void;
  closeCart: () => void;
  totalItems:() => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items:     [],
  subtotal:  0,
  isOpen:    false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const { data } = await cartAPI.get();
      set({ items: data.items || [], subtotal: data.subtotal || 0 });
    } catch {
      set({ items: [], subtotal: 0 });
    }
  },

  addItem: async (productId, quantity = 1, variantId, productName = 'Producto') => {
    set({ isLoading: true });
    try {
      await cartAPI.add(productId, quantity, variantId);
      await get().fetchCart();
      toast.success(`${productName} agregado al carrito 🛒`);
      set({ isOpen: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al agregar al carrito');
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, quantity);
      await get().fetchCart();
    } catch {
      toast.error('Error al actualizar carrito');
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      await get().fetchCart();
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar del carrito');
    }
  },

  clearCart: async () => {
    await cartAPI.clear();
    set({ items: [], subtotal: 0 });
  },

  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
  openCart:   () => set({ isOpen: true }),
  closeCart:  () => set({ isOpen: false }),
  totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
}));
