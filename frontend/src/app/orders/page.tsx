'use client';
// src/app/orders/page.tsx
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const STATUS_ES: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Pendiente',     color: 'bg-yellow-900/40 text-yellow-400' },
  CONFIRMED:  { label: 'Confirmado',   color: 'bg-blue-900/40 text-blue-400' },
  PROCESSING: { label: 'Preparando',   color: 'bg-purple-900/40 text-purple-400' },
  SHIPPED:    { label: 'Enviado',      color: 'bg-indigo-900/40 text-indigo-400' },
  DELIVERED:  { label: 'Entregado',    color: 'bg-green-900/40 text-green-400' },
  CANCELLED:  { label: 'Cancelado',    color: 'bg-red-900/40 text-red-400' },
};

export default function OrdersPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!isLoggedIn) router.push('/auth/login?redirect=/orders'); }, [isLoggedIn]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.getAll().then(r => r.data),
    enabled: isLoggedIn,
  });

  const orders = data?.orders || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-5xl tracking-wide mb-8">MIS <span className="text-brand-500">PEDIDOS</span></h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-neutral-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-neutral-500 mb-6">Aún no tienes pedidos</p>
          <Link href="/products" className="btn-primary px-6 py-3">Ver catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const st = STATUS_ES[order.status] || { label: order.status, color: 'bg-neutral-800 text-neutral-400' };
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-brand-500 text-sm font-bold">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`badge text-xs ${st.color}`}>{st.label}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2 bg-neutral-800 rounded-lg px-3 py-1.5 text-xs">
                      <span>{item.productName}</span>
                      <span className="text-neutral-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl text-brand-500">{fmt(order.total)}</p>
                  {order.trackingNumber && (
                    <p className="text-xs text-neutral-500">Guía: <span className="font-mono text-dark-50">{order.trackingNumber}</span></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
