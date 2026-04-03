'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, CreditCard, Wallet, Truck, Check, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { addressesService, ordersService, type Address } from '@/services/api'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS = [
  { id: 'UPI', name: 'UPI', icon: Wallet, description: 'Pay using UPI apps' },
  { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay with card' },
  { id: 'COD', name: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive' },
] as const

type PaymentMethod = typeof PAYMENT_METHODS[number]['id']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (items.length === 0) {
      router.push('/dashboard/cart')
      return
    }
    loadAddresses()
  }, [items, router])

  async function loadAddresses() {
    try {
      const data = await addressesService.getAll()
      setAddresses(data)
      // Select default address if available
      const defaultAddr = data.find((a) => a.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load addresses')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: parseFloat(item.product.price),
      }))

      const order = await ordersService.create({
        addressId: selectedAddressId,
        items: orderItems,
        paymentMethod: selectedPayment,
      })

      // Store order ID and clear cart
      const orderId = order.id
      clearCart()

      // Redirect to payment page
      window.location.href = `/dashboard/orders/${orderId}/pay`
    } catch (err) {
      console.error('Order creation error:', err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to place order')
      } else {
        setError('Failed to place order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <DashboardLayout title="Checkout" subtitle="Complete your purchase" role="USER">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No addresses found</p>
                  <Button onClick={() => router.push('/dashboard/addresses')}>
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                        selectedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{address.fullName}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                        <p className="text-sm mt-1">
                          {address.addressLine}, {address.city}, {address.state} {address.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                        selectedPayment === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>${(totalAmount * 0.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">${(totalAmount * 1.18).toFixed(2)}</span>
                </div>
              </div>

              {!selectedAddressId && addresses.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  Please select a delivery address
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={loading || addresses.length === 0 || !selectedAddressId}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
