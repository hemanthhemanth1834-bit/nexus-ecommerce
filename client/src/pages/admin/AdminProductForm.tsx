import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { api } from '@/utils/api'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import type { Product, Category } from '@/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Spec {
  key: string
  value: string
}

interface FormState {
  name: string
  slug: string
  description: string
  price: string
  compareAtPrice: string
  image: string
  categoryId: string
  stock: string
  featured: boolean
  specifications: Spec[]
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  image: '',
  categoryId: '',
  stock: '',
  featured: false,
  specifications: [],
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { addToast: toast } = useToast()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(isEditing)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      isEditing ? api.get<Product>(`/products/${id}`) : null,
    ])
      .then(([cats, product]) => {
        setCategories(cats)
        if (product) {
          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            price: String(product.price),
            compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
            image: product.image ?? '',
            categoryId: String(product.categoryId ?? ''),
            stock: String(product.stock),
            featured: product.featured ?? false,
            specifications: product.specifications
              ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
              : [],
          })
        }
      })
      .catch(() => toast('error', 'Failed to load data'))
      .finally(() => {
        setLoading(false)
        setCategoriesLoading(false)
      })
  }, [id, isEditing])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !isEditing) {
        next.slug = slugify(value as string)
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function addSpec() {
    setForm((prev) => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }))
  }

  function removeSpec(index: number) {
    setForm((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }))
  }

  function updateSpec(index: number, field: 'key' | 'value', val: string) {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.slug.trim()) e.slug = 'Slug is required'
    if (!form.price || Number(form.price) < 0) e.price = 'Valid price is required'
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'Valid stock is required'
    if (!form.categoryId) e.categoryId = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      image: form.image.trim(),
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      featured: form.featured,
      specifications: form.specifications.reduce<Record<string, string>>((acc, s) => {
        if (s.key.trim()) acc[s.key.trim()] = s.value.trim()
        return acc
      }, {}),
    }

    try {
      if (isEditing) {
        await api.put(`/products/${id}`, payload)
        toast('success', 'Product updated')
      } else {
        await api.post('/products', payload)
        toast('success', 'Product created')
      }
      navigate('/admin/products')
    } catch (err: any) {
      toast('error', err.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold">
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <Input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Product name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="product-slug"
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Product description"
            rows={4}
            className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Price + Compare At */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Compare at Price (optional)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => updateField('compareAtPrice', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Image URL</label>
          <Input
            value={form.image}
            onChange={(e) => updateField('image', e.target.value)}
            placeholder="https://..."
          />
          {form.image && (
            <img src={form.image} alt="Preview" className="mt-2 w-20 h-20 rounded-lg object-cover" />
          )}
        </div>

        {/* Category + Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            {categoriesLoading ? (
              <Skeleton className="h-10 rounded-xl" />
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Stock</label>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => updateField('stock', e.target.value)}
              placeholder="0"
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateField('featured', !form.featured)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              form.featured ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                form.featured ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <label className="text-sm font-medium">Featured product</label>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Specifications</label>
            <Button type="button" variant="ghost" size="sm" onClick={addSpec} className="gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {form.specifications.length === 0 ? (
            <p className="text-surface-400 text-sm">No specifications added.</p>
          ) : (
            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) => updateSpec(i, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpec(i)}
                    className="p-2 text-red-500 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
