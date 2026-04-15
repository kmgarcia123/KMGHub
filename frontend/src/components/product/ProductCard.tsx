'use client';
// src/components/product/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

interface Props { product: any; }

export default function ProductCard({ product }: Props) {
  const { addItem, isLoading } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const primaryImg = product.images?.[0]?.url;
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    addItem(product.id, 1, undefined, product.name);
  };

  return (
    <Link href={`/products/${product.slug}`} className="card group hover:-translate-y-1 hover:border-neutral-700 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-neutral-800 overflow-hidden">
        {primaryImg ? (
          <Image src={primaryImg} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">☕</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && <span className="badge badge-hot">🔥 Popular</span>}
          {discount && <span className="badge badge-sale">-{discount}%</span>}
          {!product.isFeatured && !discount && product._count?.reviews === 0 && (
            <span className="badge badge-new">✦ Nuevo</span>
          )}
        </div>
        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="flex items-center gap-2 bg-brand-500 text-dark-900 text-xs font-medium px-4 py-2 rounded-full hover:bg-brand-400 transition-colors disabled:opacity-50"
          >
            <ShoppingCart size={13} />
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-neutral-500 mb-0.5">{product.category?.name}</p>
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug">
          {product.name}
        </h3>
        {product._count?.reviews > 0 && (
          <p className="text-xs text-brand-500/80 mt-1">★ ({product._count.reviews})</p>
        )}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-lg text-brand-500">{fmt(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-neutral-500 line-through">{fmt(product.comparePrice)}</span>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-red-400 mt-1">¡Solo quedan {product.stock}!</p>
        )}
      </div>
    </Link>
  );
}
