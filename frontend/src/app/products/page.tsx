'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { SlidersHorizontal, Search } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort,     setSort]     = useState('createdAt');
  const [order,    setOrder]    = useState('desc');
  const [page,     setPage]     = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { search, category, sort, order, page, minPrice, maxPrice }],
    queryFn: () => productsAPI.getAll({
      search, category, sort, order, page, limit: 12,
      ...(minPrice && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
    }).then(r => r.data),
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data),
  });

  const products   = productsData?.products || [];
  const pagination = productsData?.pagination;
  const categories = catsData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <h2 className="font-display text-2xl tracking-wide mb-6 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-brand-500" /> FILTROS
          </h2>
          <div className="mb-6">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Categoría</p>
            <ul className="space-y-1">
              <li>
                <button onClick={() => { setCategory(''); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-brand-500/15 text-brand-500' : 'hover:bg-neutral-800 text-neutral-400'}`}>
                  Todos
                </button>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <button onClick={() => { setCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-brand-500/15 text-brand-500' : 'hover:bg-neutral-800 text-neutral-400'}`}>
                    {cat.name}
                    <span className="ml-1 text-xs text-neutral-600">({cat._count?.products})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Precio (COP)</p>
            <div className="space-y-2">
              <input type="number" placeholder="Mínimo" value={minPrice}
                onChange={e => { setMinPrice(e.target.value); setPage(1); }} className="input text-sm py-2" />
              <input type="number" placeholder="Máximo" value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value); setPage(1); }} className="input text-sm py-2" />
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Ordenar</p>
            <select value={`${sort}-${order}`}
              onChange={e => { const [s, o] = e.target.value.split('-'); setSort(s); setOrder(o); setPage(1); }}
              className="input text-sm py-2">
              <option value="createdAt-desc">Más recientes</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name-asc">A-Z</option>
            </select>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar productos..." className="input pl-9" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">
              {isLoading ? 'Cargando...' : `${pagination?.total || 0} productos`}
            </p>
            {category && (
              <button onClick={() => setCategory('')} className="text-xs text-brand-500 hover:underline">
                ✕ Limpiar
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-neutral-800" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-3/4" />
                    <div className="h-4 bg-neutral-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-neutral-500">No encontramos productos.</p>
              <button onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); }}
                className="btn-outline mt-4 text-sm px-5 py-2.5">Limpiar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Anterior</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-500 text-dark-900' : 'hover:bg-neutral-800 text-neutral-400'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Siguiente →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
