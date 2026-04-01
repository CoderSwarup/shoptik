'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Hash, TrendingUp } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productsService, type Product } from '@/services/api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await productsService.getAll()
      setProducts(data)
      setError('')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load products')
      } else {
        setError('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productsService.delete(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.stock, 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  return (
    <DashboardLayout title="Products" subtitle="Manage your inventory" role="ADMIN">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Products" value={products.length.toString()} icon={Package} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/50" />
          <StatCard label="Total Value" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/50" />
          <StatCard label="Low Stock" value={lowStock.toString()} icon={TrendingUp} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/50" />
          <StatCard label="Out of Stock" value={outOfStock.toString()} icon={Hash} color="text-red-600" bg="bg-red-50 dark:bg-red-950/50" />
        </div>

        {/* Actions bar */}
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => alert('Create modal coming soon')} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>

        {/* Products table/cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {search ? 'No products match your search' : 'No products yet'}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((product) => (
                        <tr key={product.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && (
                                <p className="truncate text-xs text-muted-foreground">{product.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">${parseFloat(product.price).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-amber-600' : 'text-muted-foreground'}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge stock={product.stock} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon-sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-border sm:hidden">
                  {filtered.map((product) => (
                    <div key={product.id} className="flex flex-col gap-3 px-4 py-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="truncate text-xs text-muted-foreground">{product.description}</p>
                          )}
                        </div>
                        <p className="font-semibold">${parseFloat(product.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusBadge stock={product.stock} />
                          <span className="text-xs text-muted-foreground">{product.stock} units</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl p-2.5 ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">Out of Stock</span>
  }
  if (stock < 10) {
    return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Low Stock</span>
  }
  return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">In Stock</span>
}
