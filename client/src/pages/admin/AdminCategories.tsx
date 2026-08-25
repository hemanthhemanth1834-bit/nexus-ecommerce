import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { api } from '@/utils/api'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

interface Category {
  id: number
  name: string
  slug: string
  _count?: { products: number }
}

export default function AdminCategories() {
  const { addToast: toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(setCategories)
      .catch(() => toast('error', 'Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditingId(null)
    setFormName('')
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id)
    setFormName(cat.name)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setFormName('')
  }

  async function handleSave() {
    const name = formName.trim()
    if (!name) {
      toast('error', 'Name is required')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const updated = await api.put<Category>(`/categories/${editingId}`, { name })
        setCategories((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c)))
        toast('success', 'Category updated')
      } else {
        const created = await api.post<Category>('/categories', { name })
        setCategories((prev) => [...prev, created])
        toast('success', 'Category created')
      }
      closeModal()
    } catch (err: any) {
      toast('error', err.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/categories/${deleteId}`)
      setCategories((prev) => prev.filter((c) => c.id !== deleteId))
      toast('success', 'Category deleted')
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to delete')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-display font-bold">Categories</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories" description="Create your first category to get started." icon={Tag} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Slug</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Products</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-surface-500">#{cat.id}</td>
                    <td className="py-3 px-4 text-sm font-medium">{cat.name}</td>
                    <td className="py-3 px-4 text-sm text-surface-500 font-mono">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{cat._count?.products ?? 0}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="p-2">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(cat.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editingId ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Category name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Category">
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Are you sure you want to delete this category? Products in this category will become uncategorized.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
