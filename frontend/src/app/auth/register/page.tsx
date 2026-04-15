'use client';
// src/app/auth/register/page.tsx
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormData {
  firstName: string; lastName: string;
  email: string; phone: string;
  password: string; confirmPassword: string;
}

export default function RegisterPage() {
  const { register: authRegister, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName, phone: data.phone });
      await fetchCart();
      toast.success('¡Cuenta creada! Bienvenido a MugHero 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-4xl tracking-widest">
            Mug<span className="text-brand-500">Hero</span>
          </Link>
          <p className="text-neutral-500 mt-2 text-sm">Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre</label>
              <input {...register('firstName', { required: 'Requerido' })} placeholder="Carlos" className="input" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Apellido</label>
              <input {...register('lastName', { required: 'Requerido' })} placeholder="Gómez" className="input" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Correo</label>
            <input {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
              type="email" placeholder="tu@email.com" className="input" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Celular</label>
            <input {...register('phone')} type="tel" placeholder="3001234567" className="input" />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
              type="password" placeholder="Mínimo 8 caracteres" className="input" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirmar contraseña</label>
            <input {...register('confirmPassword', { validate: v => v === watch('password') || 'Las contraseñas no coinciden' })}
              type="password" placeholder="Repite tu contraseña" className="input" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-brand-500 hover:underline">Ingresar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
