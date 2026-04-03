'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DeliveryZone } from '@/services/api'

interface DeliveryZoneModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    pincode: string
    city: string
    state: string
    isServiceable: boolean
    etaDays: number
    deliveryCharge: number
  }) => Promise<void>
  zone?: DeliveryZone | null
  loading?: boolean
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
]

export function DeliveryZoneModal({ open, onClose, onSubmit, zone, loading }: DeliveryZoneModalProps) {
  const [pincode, setPincode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [etaDays, setEtaDays] = useState('3')
  const [deliveryCharge, setDeliveryCharge] = useState('0')
  const [isServiceable, setIsServiceable] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!zone

  useEffect(() => {
    if (zone) {
      setPincode(zone.pincode)
      setCity(zone.city)
      setState(zone.state)
      setEtaDays(zone.etaDays.toString())
      setDeliveryCharge(zone.deliveryCharge.toString())
      setIsServiceable(zone.isServiceable)
    } else {
      setPincode('')
      setCity('')
      setState('')
      setEtaDays('3')
      setDeliveryCharge('0')
      setIsServiceable(true)
    }
    setErrors({})
  }, [zone, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }

    if (!city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!etaDays) {
      newErrors.etaDays = 'ETA days is required'
    } else if (isNaN(parseInt(etaDays)) || parseInt(etaDays) < 0) {
      newErrors.etaDays = 'ETA must be a valid non-negative integer'
    }

    if (!deliveryCharge) {
      newErrors.deliveryCharge = 'Delivery charge is required'
    } else if (isNaN(parseFloat(deliveryCharge)) || parseFloat(deliveryCharge) < 0) {
      newErrors.deliveryCharge = 'Charge must be a valid non-negative number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit({
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      isServiceable,
      etaDays: parseInt(etaDays),
      deliveryCharge: parseFloat(deliveryCharge),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pincode */}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              placeholder="e.g., 560001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              variant={errors.pincode ? 'error' : 'default'}
              disabled={loading}
              maxLength={6}
            />
            {errors.pincode && (
              <p className="text-xs text-destructive">{errors.pincode}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              variant={errors.city ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={loading}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${
                errors.state ? 'border-destructive' : 'border-input'
              }`}
            >
              <option value="">Select a state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state}</p>
            )}
          </div>

          {/* ETA Days & Delivery Charge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etaDays">ETA (Days) *</Label>
              <Input
                id="etaDays"
                type="number"
                min="0"
                step="1"
                placeholder="3"
                value={etaDays}
                onChange={(e) => setEtaDays(e.target.value)}
                variant={errors.etaDays ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.etaDays && (
                <p className="text-xs text-destructive">{errors.etaDays}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge ($) *</Label>
              <Input
                id="deliveryCharge"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                variant={errors.deliveryCharge ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.deliveryCharge && (
                <p className="text-xs text-destructive">{errors.deliveryCharge}</p>
              )}
            </div>
          </div>

          {/* Toggle */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isServiceable}
                onChange={(e) => setIsServiceable(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Serviceable (available for delivery)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Zone' : 'Create Zone'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
