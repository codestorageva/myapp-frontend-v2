"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import SideNav from "../component/drawer"
import HeaderComponent from "../component/Header-main"
import { InvoicePrintProvider, useInvoicePrint } from "@/context/InvoicePrintContext"
import InvoiceRightSidebar from "../component/right-side-bar"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  // const isInvoicePage = pathname.startsWith("/sales/invoice")
  // const isInvoicePage =
  //   pathname === "/sales/invoice/new-invoice/" ||
  //   pathname === "/sales/invoice/view-invoice/"
  const isInvoicePage =
    pathname.startsWith("/sales/invoice/new-invoice") ||
    pathname.startsWith("/sales/invoice/view-invoice")


  return (
    <div className="relative min-h-screen w-full p-0 m-0">
      {/* <img src={'/assets/images/bg-1.png'} alt="" className="w-full min-h-screen">  </img> */}
      {/* <img
        src="/assets/images/bg-new.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover -z-10"
      /> */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-[--trueBlue]" />
      <div className="relative z-10 flex h-screen">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Wrap invoice page with provider */}
        <InvoicePrintProvider>
          <main className="flex-1 overflow-y-auto hide-scrollbar mr-5 max-[640px]:ml-2 max-[640px]:mr-2 sm:ml-0">
            <div className="sticky top-0 z-20 backdrop-blur-md">
              <HeaderComponent showProfileSection={false} setSidebarOpen={setSidebarOpen} />
            </div>

            {/* Invoice content – attach ref here */}
            <InvoiceContent>{children}</InvoiceContent>
          </main>

          {/* Sidebar */}
          {isInvoicePage && (
            <aside className="w-[280px] bg-white border-l shadow-md hidden lg:block">
              <InvoiceRightSidebar />
            </aside>
          )}
        </InvoicePrintProvider>
      </div>

    </div>
  )
}

// Separate component to attach invoiceRef
function InvoiceContent({ children }: { children: React.ReactNode }) {
  const { invoiceRef } = useInvoicePrint()
  return (
    <div ref={invoiceRef} className="rounded-xl bg-[#F5F2F2] p-1 shadow-md mb-4 mt-1">
      {children}
    </div>
  )
}
