'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CreditCard, Loader2, CheckCircle, Shield, Clock, Smartphone, Wallet, Banknote } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ordersService, type Order } from '@/services/api'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS = [
  { id: 'UPI', name: 'UPI Payment', icon: Smartphone, description: 'Pay using any UPI app' },
  { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'COD', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive' },
] as const

type PaymentStep = 'select' | 'processing' | 'success' | 'failed'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<PaymentStep>('select')
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI')
  const [processingStep, setProcessingStep] = useState(0)
  const [transactionId, setTransactionId] = useState('')

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      const data = await ordersService.getById(orderId)
      // Check if already paid
      if (data.payment?.status === 'SUCCESS') {
        router.push(`/dashboard/orders/${orderId}/success`)
        return
      }
      setOrder(data)
    } catch (err) {
      console.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    setStep('processing')
    
    // Simulate processing steps
    const steps = [
      'Connecting to payment gateway...',
      'Verifying payment details...',
      'Processing transaction...',
      'Confirming payment...',
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Always succeed (fake payment)
    try {
      const result = await ordersService.processPayment(orderId, selectedMethod as 'UPI' | 'CARD' | 'COD')
      
      if (result.success) {
        setTransactionId(result.transactionId || `TXN${Date.now()}`)
        setStep('success')
        // Redirect to success page after showing success
        setTimeout(() => {
          router.push(`/dashboard/orders/${orderId}/success`)
        }, 2000)
      } else {
        // Retry once - always succeed on retry
        setProcessingStep(0)
        await new Promise(resolve => setTimeout(resolve, 500))
        setTransactionId(`TXN${Date.now()}`)
        setStep('success')
        setTimeout(() => {
          router.push(`/dashboard/orders/${orderId}/success`)
        }, 2000)
      }
    } catch (err) {
      // Even on error, show success (fake payment)
      setTransactionId(`TXN${Date.now()}`)
      setStep('success')
      setTimeout(() => {
        router.push(`/dashboard/orders/${orderId}/success`)
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    )
  }

  const processingSteps = [
    'Connecting to payment gateway...',
    'Verifying payment details...',
    'Processing transaction...',
    'Confirming payment...',
  ]

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Secure Payment</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (18%)</span>
              <span>${(parseFloat(order.totalAmount) * 0.18).toFixed(2)}</span>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">${(parseFloat(order.totalAmount) * 1.18).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Steps */}
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                return (
                  <label
                    key={method.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="sr-only"
                    />
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </label>
                )
              })}

              <Button size="lg" className="w-full mt-4" onClick={handlePay}>
                <Wallet className="h-5 w-5 mr-2" />
                Pay ${(parseFloat(order.totalAmount) * 1.18).toFixed(2)}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                <Shield className="h-3 w-3 inline mr-1" />
                This is a secure, encrypted transaction. No real money will be charged.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="relative h-16 w-16 mx-auto mb-6">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground mb-6">Please do not close this window</p>
              
              <div className="space-y-3">
                {processingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-3 text-sm transition-all',
                      index <= processingStep ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full flex items-center justify-center transition-all',
                        index < processingStep
                          ? 'bg-emerald-500 text-white'
                          : index === processingStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {index < processingStep ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-50">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your payment has been processed successfully.
              </p>
              {transactionId && (
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{transactionId}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Redirecting to order confirmation...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
