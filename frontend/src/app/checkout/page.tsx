'use client';
// src/app/checkout/page.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

interface AddressForm {
  fullName: string; phone: string; street: string;
  city: string; department: string; label: string; notes: string;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('WOMPI');
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const shipping = subtotal >= 100000 ? 0 : 8000;
  const total = subtotal + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { label: 'Casa', city: 'Bogotá', department: 'Cundinamarca' },
  });

  const onSubmit = async (data: AddressForm) => {
    if (items.length === 0) { toast.error('Tu carrito está vacío'); return; }
    setPlacing(true);
    try {
      // Crear orden (sin addressId guardado — en producción primero guarda la dirección)
      const { data: order } = await ordersAPI.create({
        addressId: undefined as any,
        notes: data.notes,
        paymentMethod,
      });
      await clearCart();
      setDone(order.orderNumber);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al crear orden');
    } finally {
      setPlacing(false);
    }
  };

  // Success screen
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
          <h1 className="font-display text-5xl tracking-wide mb-3">¡ORDEN CREADA!</h1>
          <p className="text-neutral-400 mb-2">Tu número de orden es:</p>
          <p className="font-mono text-brand-500 text-xl font-bold mb-6">{done}</p>
          <p className="text-neutral-500 text-sm mb-8">Te contactaremos para confirmar el pago y coordinar el envío. También puedes escribirnos por WhatsApp.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/')} className="btn-primary px-6 py-3">Seguir comprando</button>
            <button onClick={() => router.push('/orders')} className="btn-outline px-6 py-3">Mis pedidos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-5xl tracking-wide mb-8">CHECKOUT</h1>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">

          {/* Delivery address */}
          <div className="card p-6">
            <h2 className="font-medium mb-5">Dirección de envío</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre completo *</label>
                  <input {...register('fullName', { required: 'Requerido' })}
                    defaultValue={user ? `${user.firstName} ${user.lastName}` : ''}
                    className="input" />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="label">Celular *</label>
                  <input {...register('phone', { required: 'Requerido' })} type="tel" placeholder="3001234567" className="input" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Dirección completa *</label>
                <input {...register('street', { required: 'Requerido' })}
                  placeholder="Calle 123 # 45-67, Apto 201" className="input" />
                {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Ciudad *</label>
                  <input {...register('city', { required: 'Requerido' })} className="input" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">Departamento</label>
                  <input {...register('department')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Notas del pedido (opcional)</label>
                <input {...register('notes')} placeholder="Instrucciones especiales, color preferido..." className="input" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-medium mb-5">Método de pago</h2>
            <div className="space-y-3">
              {[
                { value: 'WOMPI',            label: 'Wompi',            desc: 'Tarjeta crédito/débito, PSE',   emoji: '💳' },
                { value: 'NEQUI',            label: 'Nequi / Daviplata',desc: 'Transferencia inmediata',       emoji: '📱' },
                { value: 'CASH_ON_DELIVERY', label: 'Contraentrega',    desc: 'Paga al recibir (solo Bogotá)', emoji: '💵' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-brand-500 bg-brand-500/5' : 'border-neutral-700 hover:border-neutral-600'}`}>
                  <input type="radio" value={opt.value} checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)} className="accent-brand-500 w-4 h-4" />
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-neutral-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={placing} className="btn-primary w-full py-4 text-base">
            {placing ? 'Procesando...' : `Confirmar pedido · ${fmt(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-24">
            <h2 className="font-medium mb-4">Resumen del pedido</h2>
            <ul className="space-y-3 mb-4">
              {items.map(item => (
                <li key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden shrink-0 relative">
                    {item.product.images[0]?.url
                      ? <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">☕</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium shrink-0">{fmt(item.product.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span><span className="text-dark-50">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-dark-50'}>
                  {shipping === 0 ? 'GRATIS' : fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-display text-xl pt-2 border-t border-neutral-800">
                <span>TOTAL</span>
                <span className="text-brand-500">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
