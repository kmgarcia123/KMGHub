'use client';
// src/app/admin/page.tsx
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingBag, Users, DollarSign, Package, Plus, Eye } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-900/40 text-yellow-400',
  CONFIRMED:  'bg-blue-900/40 text-blue-400',
  PROCESSING: 'bg-purple-900/40 text-purple-400',
  SHIPPED:    'bg-indigo-900/40 text-indigo-400',
  DELIVERED:  'bg-green-900/40 text-green-400',
  CANCELLED:  'bg-red-900/40 text-red-400',
};

export default function AdminPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'ADMIN') router.push('/');
  }, [isLoggedIn, user]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats().then(r => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminAPI.getOrders({ limit: 8 }).then(r => r.data),
  });

  const orders = ordersData?.orders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-5xl tracking-wide">PANEL <span className="text-brand-500">ADMIN</span></h1>
          <p className="text-neutral-500 mt-1">Gestiona tu tienda MugHero</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total órdenes',  value: stats?.totalOrders  || 0,              icon: ShoppingBag, color: 'text-blue-400' },
          { label: 'Ingresos',       value: fmt(stats?.totalRevenue || 0),          icon: DollarSign,  color: 'text-green-400' },
          { label: 'Productos',      value: stats?.totalProducts || 0,              icon: Package,     color: 'text-brand-500' },
          { label: 'Clientes',       value: stats?.totalUsers   || 0,              icon: Users,       color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-neutral-500 uppercase tracking-widest">{label}</p>
              <div className={`w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </div>
            </div>
            <p className="font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Ver productos',   href: '/admin/products',     icon: Package },
          { label: 'Agregar producto',href: '/admin/products/new', icon: Plus },
          { label: 'Ver órdenes',     href: '/admin/orders',       icon: ShoppingBag },
          { label: 'Ver tienda',      href: '/',                   icon: Eye },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="card p-4 flex items-center gap-3 hover:border-neutral-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
              <Icon size={16} />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="font-display text-xl tracking-wide">ÓRDENES RECIENTES</h2>
          <Link href="/admin/orders" className="text-sm text-brand-500 hover:underline">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Orden</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Total</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-left px-6 py-3">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center px-6 py-10 text-neutral-500">No hay órdenes aún</td></tr>
              ) : orders.map((order: any) => (
                <tr key={order.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-brand-500 text-xs">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    {order.user?.firstName} {order.user?.lastName}
                    <div className="text-xs text-neutral-500">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{fmt(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge text-xs px-2.5 py-1 ${STATUS_COLORS[order.status] || 'bg-neutral-800 text-neutral-400'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-brand-500 hover:underline text-xs">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
