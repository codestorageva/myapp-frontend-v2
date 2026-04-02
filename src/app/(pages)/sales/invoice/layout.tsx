'use client'

import { InvoicePrintProvider } from '@/context/InvoicePrintContext'

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InvoicePrintProvider>
      {children}
    </InvoicePrintProvider>
  )
}
