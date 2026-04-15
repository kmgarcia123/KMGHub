'use client';
// src/components/cart/CartSidebar.tsx
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function CartSidebar() {
  const { items, subtotal, isOpen, closeCart, updateItem, removeItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const shipping = subtotal >= 100000 ? 0 : 8000;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    closeCart();
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={closeCart} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900 border-l border-neutral-800 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="font-display text-2xl tracking-wider">MI CARRITO</h2>
          <button onClick={closeCart} className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-neutral-700" />
              <p className="text-neutral-500">Tu carrito está vacío</p>
              <button onClick={closeCart} className="btn-primary text-sm px-5 py-2.5">
                Ver catálogo
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(item => (
                <li key={item.id} className="flex gap-4 pb-4 border-b border-neutral-800 last:border-0">
                  {/* Thumb */}
                  <div className="w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden shrink-0 relative">
                    {item.product.images[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">☕</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} onClick={closeCart}
                      className="text-sm font-medium hover:text-brand-500 transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    <p className="text-brand-500 font-display text-lg mt-1">{fmt(item.product.price)}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md border border-neutral-700 flex items-center justify-center hover:border-neutral-500 transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 size={12} className="text-red-400" /> : <Minus size={12} />}
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded-md border border-neutral-700 flex items-center justify-center hover:border-neutral-500 transition-colors disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Total item */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{fmt(item.product.price * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-800 space-y-3">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Subtotal</span><span className="text-dark-50">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Envío</span>
              <span className={shipping === 0 ? 'text-green-400' : 'text-dark-50'}>
                {shipping === 0 ? 'GRATIS 🎉' : fmt(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-neutral-500">
                Agrega {fmt(100000 - subtotal)} más para envío gratis
              </p>
            )}
            <div className="flex justify-between font-display text-xl border-t border-neutral-800 pt-3">
              <span>TOTAL</span>
              <span className="text-brand-500">{fmt(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full py-3.5 text-base">
              Ir a pagar →
            </button>
            <button onClick={closeCart} className="btn-outline w-full py-3 text-sm">
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
