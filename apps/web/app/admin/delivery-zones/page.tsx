'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, MapPin, Truck, DollarSign, Clock, Loader2, Check, X } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deliveryZonesService, type DeliveryZone } from '@/services/api'
import { DeliveryZoneModal } from '@/components/delivery-zones/DeliveryZoneModal'

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadZones()
  }, [page])

  async function loadZones() {
    try {
      setLoading(true)
      setError('')
      const result = await deliveryZonesService.getAll(page, 20)
      setZones(result.data)
      setTotal(result.total)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load delivery zones')
      } else {
        setError('Failed to load delivery zones')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setEditingZone(null)
    setModalOpen(true)
  }

  function handleOpenEdit(zone: DeliveryZone) {
    setEditingZone(zone)
    setModalOpen(true)
  }

  async function handleSubmit(data: {
    pincode: string
    city: string
    state: string
    isServiceable: boolean
    etaDays: number
    deliveryCharge: number
  }) {
    setModalLoading(true)
    try {
      if (editingZone) {
        const updated = await deliveryZonesService.update(editingZone.id, data)
        setZones((prev) =>
          prev.map((z) => (z.id === updated.id ? updated : z))
        )
      } else {
        const created = await deliveryZonesService.create(data)
        setZones((prev) => [created, ...prev])
        setTotal((t) => t + 1)
      }
      setModalOpen(false)
      setEditingZone(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Operation failed')
      } else {
        alert('Operation failed')
      }
    } finally {
      setModalLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return

    setDeletingId(id)
    try {
      await deliveryZonesService.delete(id)
      setZones((prev) => prev.filter((z) => z.id !== id))
      setTotal((t) => t - 1)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Failed to delete delivery zone')
      } else {
        alert('Failed to delete delivery zone')
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function toggleServiceable(zone: DeliveryZone) {
    try {
      const updated = await deliveryZonesService.update(zone.id, {
        isServiceable: !zone.isServiceable,
      })
      setZones((prev) =>
        prev.map((z) => (z.id === updated.id ? updated : z))
      )
    } catch {
      alert('Failed to update serviceable status')
    }
  }

  const filtered = zones.filter((z) =>
    z.pincode.includes(search) ||
    z.city.toLowerCase().includes(search.toLowerCase()) ||
    z.state.toLowerCase().includes(search.toLowerCase())
  )

  const serviceableCount = zones.filter((z) => z.isServiceable).length
  const avgEta = zones.length > 0
    ? (zones.reduce((sum, z) => sum + z.etaDays, 0) / zones.length).toFixed(1)
    : '0'
  const avgCharge = zones.length > 0
    ? (zones.reduce((sum, z) => sum + z.deliveryCharge, 0) / zones.length).toFixed(2)
    : '0'

  return (
    <DashboardLayout title="Delivery Zones" subtitle="Manage serviceable areas" role="ADMIN">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Zones"
            value={total.toString()}
            icon={MapPin}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950/50"
            border="border-blue-200 dark:border-blue-800"
          />
          <StatCard
            label="Serviceable"
            value={serviceableCount.toString()}
            icon={Check}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950/50"
            border="border-emerald-200 dark:border-emerald-800"
          />
          <StatCard
            label="Avg. ETA"
            value={`${avgEta} days`}
            icon={Clock}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-950/50"
            border="border-amber-200 dark:border-amber-800"
          />
          <StatCard
            label="Avg. Charge"
            value={`$${avgCharge}`}
            icon={DollarSign}
            color="text-violet-600 dark:text-violet-400"
            bg="bg-violet-50 dark:bg-violet-950/50"
            border="border-violet-200 dark:border-violet-800"
          />
        </div>

        {/* Actions bar */}
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by pincode, city, state..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </CardContent>
        </Card>

        {/* Zones table/cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery Zones ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
                  {error}
                </div>
                <Button variant="outline" size="sm" onClick={loadZones}>
                  Try Again
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Truck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? 'No zones match your search' : 'No delivery zones yet'}
                </p>
                {!search && (
                  <Button size="sm" className="mt-4" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first zone
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pincode</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">City</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">State</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">ETA</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Charge</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((zone) => (
                        <tr key={zone.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <span className="font-mono font-medium">{zone.pincode}</span>
                          </td>
                          <td className="px-6 py-4">{zone.city}</td>
                          <td className="px-6 py-4 text-muted-foreground">{zone.state}</td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {zone.etaDays} day{zone.etaDays !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">${zone.deliveryCharge.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleServiceable(zone)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                zone.isServiceable
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200'
                              }`}
                            >
                              {zone.isServiceable ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Serviceable
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Not Serviceable
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenEdit(zone)}
                                title="Edit zone"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(zone.id)}
                                disabled={deletingId === zone.id}
                                title="Delete zone"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                {deletingId === zone.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-border lg:hidden">
                  {filtered.map((zone) => (
                    <div key={zone.id} className="flex flex-col gap-3 px-4 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-lg">{zone.pincode}</span>
                            <button
                              onClick={() => toggleServiceable(zone)}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                zone.isServiceable
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              }`}
                            >
                              {zone.isServiceable ? 'Serviceable' : 'Not Serviceable'}
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">{zone.city}, {zone.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${zone.deliveryCharge.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{zone.etaDays} day{zone.etaDays !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(zone)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(zone.id)}
                          disabled={deletingId === zone.id}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          {deletingId === zone.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Page {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={zones.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delivery Zone Modal */}
      <DeliveryZoneModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingZone(null)
        }}
        onSubmit={handleSubmit}
        zone={editingZone}
        loading={modalLoading}
      />
    </DashboardLayout>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  border,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
}) {
  return (
    <Card className={border}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2 ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
