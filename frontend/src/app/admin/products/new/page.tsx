'use client';
// src/app/admin/products/new/page.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, categoriesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Upload, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductForm {
  name: string; description: string; shortDesc: string;
  price: number; comparePrice: number; cost: number;
  sku: string; stock: number; categoryId: string;
  isFeatured: boolean; weight: number;
  tags: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages]       = useState<{ url: string; alt: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>();

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { data } = await adminAPI.uploadImage(file);
        setImages(prev => [...prev, { url: data.url, alt: '' }]);
      }
      toast.success('Imagen(es) subida(s)');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data: ProductForm) => {
    if (images.length === 0) { toast.error('Agrega al menos una imagen'); return; }
    setSaving(true);
    try {
      await adminAPI.createProduct({
        ...data,
        price: parseFloat(String(data.price)),
        comparePrice: data.comparePrice ? parseFloat(String(data.comparePrice)) : null,
        cost: data.cost ? parseFloat(String(data.cost)) : null,
        stock: parseInt(String(data.stock)),
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        images,
      });
      toast.success('¡Producto creado!');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al crear producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="btn-ghost p-2"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-4xl tracking-wide">NUEVO <span className="text-brand-500">PRODUCTO</span></h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left - main info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Images */}
            <div className="card p-6">
              <h2 className="font-medium mb-4">Imágenes del producto</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800 group">
                    <Image src={img.url} alt={img.alt} fill className="object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-xs bg-brand-500 text-dark-900 px-1.5 py-0.5 rounded font-medium">Principal</span>
                    )}
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-900/80 text-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-700 hover:border-brand-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={20} className="text-neutral-500" />
                      <span className="text-xs text-neutral-500">Subir foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-neutral-500">La primera imagen será la principal. JPG, PNG o WebP. Máx 5MB por imagen.</p>
            </div>

            {/* Basic info */}
            <div className="card p-6 space-y-4">
              <h2 className="font-medium">Información básica</h2>
              <div>
                <label className="label">Nombre del producto *</label>
                <input {...register('name', { required: 'Requerido' })}
                  placeholder="Ej: Pocillo Batman Dark Knight" className="input" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Descripción corta</label>
                <input {...register('shortDesc')} placeholder="Cerámica 350ml · Relieve Batman · Apto microondas" className="input" />
              </div>
              <div>
                <label className="label">Descripción completa *</label>
                <textarea {...register('description', { required: 'Requerido' })}
                  rows={4} placeholder="Describe el producto en detalle..." className="input resize-none" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="label">Etiquetas (separadas por coma)</label>
                <input {...register('tags')} placeholder="batman, dc, superheroes, mugs" className="input" />
              </div>
            </div>
          </div>

          {/* Right - pricing & stock */}
          <div className="space-y-5">

            {/* Status */}
            <div className="card p-5 space-y-3">
              <h2 className="font-medium">Estado</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register('isFeatured')} type="checkbox"
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm">Producto destacado</span>
              </label>
            </div>

            {/* Category */}
            <div className="card p-5">
              <h2 className="font-medium mb-4">Categoría</h2>
              <select {...register('categoryId')} className="input">
                <option value="">Sin categoría</option>
                {(catsData || []).map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div className="card p-5 space-y-3">
              <h2 className="font-medium">Precios (COP)</h2>
              <div>
                <label className="label">Precio de venta *</label>
                <input {...register('price', { required: 'Requerido', min: { value: 1, message: 'Debe ser mayor a 0' } })}
                  type="number" placeholder="38000" className="input" />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label">Precio tachado (antes de)</label>
                <input {...register('comparePrice')} type="number" placeholder="45000" className="input" />
              </div>
              <div>
                <label className="label">Costo (interno)</label>
                <input {...register('cost')} type="number" placeholder="15000" className="input" />
              </div>
            </div>

            {/* Stock */}
            <div className="card p-5 space-y-3">
              <h2 className="font-medium">Inventario</h2>
              <div>
                <label className="label">SKU</label>
                <input {...register('sku')} placeholder="MUG-DC-001" className="input" />
              </div>
              <div>
                <label className="label">Stock *</label>
                <input {...register('stock', { required: 'Requerido', min: 0 })}
                  type="number" placeholder="50" className="input" />
              </div>
              <div>
                <label className="label">Peso (gramos)</label>
                <input {...register('weight')} type="number" placeholder="320" className="input" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
              {saving ? 'Guardando...' : 'Crear producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
