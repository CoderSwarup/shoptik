'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, Loader2, Check, Star } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddressModal } from '@/components/addresses/AddressModal'
import { addressesService, type Address } from '@/services/api'
import { cn } from '@/lib/utils'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  async function loadAddresses() {
    try {
      setLoading(true)
      setError('')
      const data = await addressesService.getAll()
      setAddresses(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load addresses')
      } else {
        setError('Failed to load addresses')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setEditingAddress(null)
    setModalOpen(true)
  }

  function handleOpenEdit(address: Address) {
    setEditingAddress(address)
    setModalOpen(true)
  }

  async function handleSubmit(data: {
    fullName: string
    phone: string
    addressLine: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
  }) {
    setModalLoading(true)
    try {
      if (editingAddress) {
        const updated = await addressesService.update(editingAddress.id, data)
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        )
      } else {
        const created = await addressesService.create(data)
        setAddresses((prev) => [...prev, created])
      }
      setModalOpen(false)
      setEditingAddress(null)
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

  async function handleSetDefault(address: Address) {
    try {
      const updated = await addressesService.setDefault(address.id)
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === updated.id,
        }))
      )
    } catch (err) {
      alert('Failed to set default address')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return

    setDeletingId(id)
    try {
      await addressesService.delete(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Failed to delete address')
      } else {
        alert('Failed to delete address')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout title="My Addresses" subtitle="Manage your delivery addresses" role="USER">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
              {error}
            </div>
            <Button variant="outline" size="sm" onClick={loadAddresses}>
              Try Again
            </Button>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No addresses yet</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                Add your first address to make checkout faster and easier.
              </p>
              <Button className="mt-6" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={cn(
                  'relative overflow-hidden transition-all hover:shadow-md',
                  address.isDefault && 'border-primary border-2'
                )}
              >
                {address.isDefault && (
                  <div className="absolute right-0 top-0">
                    <div className="flex items-center gap-1 rounded-bl-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </div>
                  </div>
                )}

                <CardContent className="pt-6">
                  {/* Name & Phone */}
                  <div className="mb-3">
                    <p className="font-semibold">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                  </div>

                  {/* Address */}
                  <div className="mb-4 space-y-0.5 text-sm text-muted-foreground">
                    <p>{address.addressLine}</p>
                    <p>
                      {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address)}
                        className="flex-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(address)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      {deletingId === address.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Card */}
            <Card
              className="flex cursor-pointer items-center justify-center border-dashed hover:border-primary hover:bg-muted/50 transition-colors min-h-[200px]"
              onClick={handleOpenCreate}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Add New Address</span>
              </div>
            </Card>
          </div>
        )}

        {/* Tips */}
        {addresses.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="flex items-start gap-3 py-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Quick Tip</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set a default address for faster checkout. Your default address will be pre-selected when placing orders.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Address Modal */}
      <AddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingAddress(null)
        }}
        onSubmit={handleSubmit}
        address={editingAddress}
        loading={modalLoading}
      />
    </DashboardLayout>
  )
}
