'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, MapPin, CheckCircle, XCircle, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addressesService, type PincodeValidation } from '@/services/api'

interface AddressModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    fullName: string
    phone: string
    addressLine: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
  }) => Promise<void>
  address?: Address | null
  loading?: boolean
}

interface Address {
  id: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  pincode: string
  isDefault: boolean | null
}

export function AddressModal({ open, onClose, onSubmit, address, loading }: AddressModalProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pincode validation state
  const [pincodeValidation, setPincodeValidation] = useState<PincodeValidation | null>(null)
  const [validatingPincode, setValidatingPincode] = useState(false)
  const [pincodeTouched, setPincodeTouched] = useState(false)

  const isEditing = !!address

  useEffect(() => {
    if (address) {
      setFullName(address.fullName)
      setPhone(address.phone)
      setAddressLine(address.addressLine)
      setCity(address.city)
      setState(address.state)
      setPincode(address.pincode)
      setIsDefault(address.isDefault ?? false)
      setPincodeTouched(false)
      setPincodeValidation(null)
    } else {
      setFullName('')
      setPhone('')
      setAddressLine('')
      setCity('')
      setState('')
      setPincode('')
      setIsDefault(false)
      setPincodeTouched(false)
      setPincodeValidation(null)
    }
    setErrors({})
  }, [address, open])

  // Validate pincode when it changes
  useEffect(() => {
    if (pincode.length >= 4 && pincodeTouched) {
      const timeoutId = setTimeout(async () => {
        setValidatingPincode(true)
        try {
          const result = await addressesService.validatePincode(pincode)
          setPincodeValidation(result)

          // Auto-fill city and state if valid
          if (result.valid && result.serviceable) {
            if (result.city && !city) setCity(result.city)
            if (result.state && !state) setState(result.state)
          }
        } catch {
          setPincodeValidation({
            valid: false,
            serviceable: false,
            city: null,
            state: null,
            etaDays: null,
            deliveryCharge: null,
          })
        } finally {
          setValidatingPincode(false)
        }
      }, 500) // Debounce 500ms

      return () => clearTimeout(timeoutId)
    } else {
      setPincodeValidation(null)
    }
  }, [pincode, pincodeTouched])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (phone.length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits'
    }

    if (!addressLine.trim()) {
      newErrors.addressLine = 'Address is required'
    } else if (addressLine.trim().length < 5) {
      newErrors.addressLine = 'Address must be at least 5 characters'
    }

    if (!city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (pincode.length < 4) {
      newErrors.pincode = 'Pincode must be at least 4 characters'
    } else if (pincodeValidation && !pincodeValidation.serviceable) {
      newErrors.pincode = 'Delivery is not available for this pincode'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault,
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
              {isEditing ? 'Edit Address' : 'Add New Address'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              variant={errors.fullName ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant={errors.phone ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Address Line */}
          <div className="space-y-2">
            <Label htmlFor="addressLine">Street Address *</Label>
            <Input
              id="addressLine"
              placeholder="123 Main Street, Apt 4B"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              variant={errors.addressLine ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.addressLine && (
              <p className="text-xs text-destructive">{errors.addressLine}</p>
            )}
          </div>

          {/* Pincode with validation */}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode / ZIP Code *</Label>
            <div className="relative">
              <Input
                id="pincode"
                placeholder="560001"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value)
                  setPincodeTouched(true)
                }}
                variant={errors.pincode ? 'error' : 'default'}
                disabled={loading}
                maxLength={10}
              />
              {validatingPincode && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!validatingPincode && pincodeValidation && (
                pincodeValidation.serviceable ? (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )
              )}
            </div>
            {errors.pincode && (
              <p className="text-xs text-destructive">{errors.pincode}</p>
            )}
            {pincodeValidation && !validatingPincode && (
              <div className={`text-xs p-2 rounded-lg ${
                pincodeValidation.serviceable
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
              }`}>
                {pincodeValidation.serviceable ? (
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5" />
                    <span>
                      Delivery available • ETA: {pincodeValidation.etaDays} day(s) •
                      Charge: ${pincodeValidation.deliveryCharge?.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span>Delivery is not available for this pincode</span>
                )}
              </div>
            )}
          </div>

          {/* City, State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                variant={errors.city ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                variant={errors.state ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Default Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">Set as default address</span>
          </label>

          {/* Actions */}
          <div className="sticky bottom-0 flex gap-3 pt-4 border-t border-border bg-card">
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
              disabled={loading || validatingPincode || (pincodeTouched && pincodeValidation !== null && !pincodeValidation.serviceable)}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isEditing ? 'Update Address' : 'Save Address'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
