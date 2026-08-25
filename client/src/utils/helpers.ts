export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getDiscountPercent(price: number, compareAt: number): number {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function parseImages(images: unknown): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images.filter(Boolean)
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
      return parsed ? [parsed] : []
    } catch {
      return images.startsWith('http') ? [images] : []
    }
  }
  return []
}

export function getProductImages(product: { image?: string; images?: unknown }): string[] {
  const parsed = parseImages(product.images)
  if (parsed.length > 0) return parsed
  if (product.image) return [product.image]
  return []
}
