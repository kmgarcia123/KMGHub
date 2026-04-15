'use client';
// src/components/layout/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { totalItems, toggleCart, fetchCart } = useCartStore();
  const { user, isLoggedIn, logout, fetchMe } = useAuthStore();
  const [search, setSearch]     = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    if (isLoggedIn) { fetchMe(); fetchCart(); }
  }, [isLoggedIn]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const itemCount = totalItems();

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="font-display text-3xl tracking-widest shrink-0">
          Mug<span className="text-brand-500">Hero</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
          <div className="flex w-full bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden focus-within:border-brand-500 transition-colors">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar Batman, Goku, Spider-Man..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-dark-50 placeholder-neutral-500 outline-none"
            />
            <button type="submit" className="px-4 bg-brand-500 hover:bg-brand-400 transition-colors">
              <Search size={16} className="text-dark-900" />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative btn-ghost p-2.5"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-dark-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* User menu */}
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 btn-ghost px-3 py-2"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-500 text-xs font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="text-sm hidden sm:block">{user.firstName}</span>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <Link href="/orders" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-800 transition-colors">
                    <ShoppingCart size={16} className="text-neutral-400" /> Mis pedidos
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-800 transition-colors text-brand-500">
                      <LayoutDashboard size={16} /> Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-neutral-800 transition-colors text-red-400">
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-2 btn-outline px-4 py-2 text-sm">
              <User size={16} /> Ingresar
            </Link>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2.5 md:hidden">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-neutral-800 pt-3">
          <form onSubmit={handleSearch} className="flex bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-dark-50 placeholder-neutral-500"
            />
            <button type="submit" className="px-4 bg-brand-500">
              <Search size={16} className="text-dark-900" />
            </button>
          </form>
          <nav className="mt-3 flex flex-col gap-1">
            <Link href="/products" className="px-3 py-2 text-sm hover:bg-neutral-800 rounded-lg">Catálogo</Link>
            <Link href="/products?featured=true" className="px-3 py-2 text-sm hover:bg-neutral-800 rounded-lg">Destacados</Link>
          </nav>
        </div>
      )}
    </nav>
  );
}
