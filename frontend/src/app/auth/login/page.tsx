'use client';
// src/app/auth/login/page.tsx
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormData { email: string; password: string; }

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      await fetchCart();
      toast.success('¡Bienvenido de vuelta! 👋');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-4xl tracking-widest">
            Mug<span className="text-brand-500">Hero</span>
          </Link>
          <p className="text-neutral-500 mt-2 text-sm">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <input {...register('email', { required: 'Campo requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
              type="email" placeholder="tu@email.com" className="input" autoComplete="email" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="label mb-0">Contraseña</label>
              <a href="#" className="text-xs text-brand-500 hover:underline">¿Olvidaste?</a>
            </div>
            <div className="relative">
              <input {...register('password', { required: 'Campo requerido' })}
                type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-10" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-neutral-500">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-brand-500 hover:underline">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
