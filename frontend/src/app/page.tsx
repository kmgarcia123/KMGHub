// src/app/page.tsx
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

async function getFeatured() {
  try {
    const { data } = await productsAPI.getAll({ featured: true, limit: 4 });
    return data.products || [];
  } catch { return []; }
}

async function getCategories() {
  try {
    const { data } = await categoriesAPI.getAll();
    return data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategories()]);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 animate-fade-in-up">
            <p className="text-brand-500 text-xs tracking-[4px] uppercase mb-5">✦ Colección Exclusiva · Colombia</p>
            <h1 className="font-display text-6xl md:text-8xl leading-none tracking-wide mb-6">
              TU HÉROE<br />EN TU <span className="text-brand-500">TAZA</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-md mb-8 leading-relaxed">
              Pocillos de cerámica premium con tus personajes favoritos. DC, Marvel, Anime y más. Envíos a toda Colombia.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products" className="btn-primary text-base px-8 py-3.5">
                Ver catálogo
              </Link>
              <Link href="/products?featured=true" className="btn-outline text-base px-8 py-3.5">
                Destacados
              </Link>
            </div>
            <div className="flex gap-10 mt-12">
              {[['50+', 'Diseños'], ['4.9★', 'Calificación'], ['24h', 'Despacho']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl text-brand-500">{n}</div>
                  <div className="text-xs text-neutral-500 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mug grid */}
          <div className="grid grid-cols-2 gap-3 w-72 shrink-0">
            {[
              { emoji: '🦇', bg: 'bg-neutral-800', border: 'border-brand-500/20' },
              { emoji: '🕷️', bg: 'bg-red-950/50',  border: 'border-red-900/30' },
              { emoji: '⚡', bg: 'bg-purple-950/50', border: 'border-purple-900/30' },
              { emoji: '🤖', bg: 'bg-orange-950/50', border: 'border-orange-900/30' },
            ].map((m, i) => (
              <div key={i} className={`${m.bg} border ${m.border} rounded-2xl aspect-square flex items-center justify-center text-5xl hover:scale-105 transition-transform cursor-default`}>
                {m.emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────────────────── */}
      <section className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck,  title: 'Envío gratis', desc: 'En compras mayores a $100.000' },
            { icon: Shield, title: 'Garantía',      desc: 'Calidad certificada en cada producto' },
            { icon: Zap,    title: 'Rápido',         desc: 'Despacho en 24h hábiles' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-4 py-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-brand-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 border-b border-neutral-800">
          <h2 className="font-display text-4xl tracking-wide mb-8">CATEGORÍAS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="card p-5 hover:border-brand-500/40 transition-all group">
                <div className="font-display text-xl tracking-wide group-hover:text-brand-500 transition-colors">{cat.name}</div>
                <p className="text-xs text-neutral-500 mt-1">{cat._count?.products || 0} productos</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-4xl tracking-wide">
            MÁS <span className="text-brand-500">POPULARES</span>
          </h2>
          <Link href="/products" className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-400 transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
