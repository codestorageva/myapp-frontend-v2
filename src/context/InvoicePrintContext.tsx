'use client'

import { createContext, useContext, useRef } from 'react'

type InvoicePrintContextType = {
  invoiceRef: React.RefObject<HTMLDivElement | null>
}

const InvoicePrintContext = createContext<InvoicePrintContextType | null>(null)

export const useInvoicePrint = () => {
  const ctx = useContext(InvoicePrintContext)
  if (!ctx) {
    throw new Error('useInvoicePrint must be used inside InvoicePrintProvider')
  }
  return ctx
}

export const InvoicePrintProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null)

  return (
    <InvoicePrintContext.Provider value={{ invoiceRef }}>
      {children}
    </InvoicePrintContext.Provider>
  )
}
