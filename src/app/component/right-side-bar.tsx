

// 'use client'

// import { useInvoicePrint } from '@/context/InvoicePrintContext'
// import { Printer, LayoutTemplate, X } from 'lucide-react'
// import { useEffect, useRef, useState } from 'react'
// import { useReactToPrint } from 'react-to-print'
// import { useRouter, usePathname, useParams } from 'next/navigation'
// import { ROUTES } from '../constants/routes'
// import NewInvoice from './InvoiceView'
// import PreviewInvoice from './view_invoice'

// // ✅ Change 1 - New imports add karya
// import { getCompanyById } from '@/app/(pages)/dashboard-page/dashboard'
// import { getAllInvoiceById, InvoiceData } from '../(pages)/sales/invoice/generate-invoice/generate-invoice'
// import { CompanyData } from '@/app/organization/main-dashboard/company-list'
// import { decodeId } from '@/app/utils/hash-service'

// const PRINT_OPTIONS = [
//     { value: 1, title: 'One Copy', desc: 'An original copy will be printed.' },
//     { value: 2, title: 'Two Copies', desc: 'A supplier copy and a recipient copy will be printed.' },
//     { value: 3, title: 'Three Copies', desc: 'A supplier copy, a transporter copy, and a recipient copy will be printed.' },
//     { value: 4, title: 'Four Copies', desc: 'One additional copy will be printed.' },
//     { value: 5, title: 'Five Copies', desc: 'Two additional copies will be printed.' }
// ]

// const getCopyLabel = (index: number) => {
//     switch (index) {
//         case 0:
//             return 'Original for Recipient'
//         case 1:
//             return 'Duplicate for Transporter'
//         case 2:
//             return 'Triplicate for Supplier'
//         case 3:
//             return 'QUADRUPLICATE'
//         case 4:
//             return 'QUINTUPLICATE'
//         default:
//             return `Extra Copy ${index + 1}`
//     }
// }

// const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// const InvoiceRightSidebar = () => {
//     const { invoiceRef } = useInvoicePrint()

//     const router = useRouter()
//     const pathname = usePathname()
//     const params = useParams()
//     const encodedId = params.id as string

//     const [showPrintModal, setShowPrintModal] = useState(false)
//     const [selectedCopies, setSelectedCopies] = useState(3)
//     const [dontShowAgain, setDontShowAgain] = useState(false)

//     const [isPreparingPrint, setIsPreparingPrint] = useState(false)
//     const [isPrintReady, setIsPrintReady] = useState(false)
//     const [printTrigger, setPrintTrigger] = useState(0)

//     // ✅ Change 2 - Cache states add karya
//     const [cachedCompanyData, setCachedCompanyData] = useState<CompanyData | undefined>()
//     const [cachedInvoiceData, setCachedInvoiceData] = useState<InvoiceData | undefined>()

//     const printContainerRef = useRef<HTMLDivElement>(null)

//     // ✅ Change 3 - Pre-fetch useEffect add karyu
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const companyId = localStorage.getItem('selectedCompanyId')
//                 if (companyId) {
//                     const res = await getCompanyById(companyId)
//                     if (res.success) setCachedCompanyData(res.data)
//                 }
//                 if (encodedId) {
//                     const decryptedId = decodeId(encodedId) ?? ''
//                     if (decryptedId) {
//                         const res = await getAllInvoiceById({ id: decryptedId })
//                         if (res.success) setCachedInvoiceData(res.data)
//                     }
//                 }
//             } catch (e) {
//                 console.error('Failed to pre-fetch print data', e)
//             }
//         }
//         fetchData()
//     }, [encodedId])

//     const isTemplate1 = pathname.includes('new-invoice')
//     const isTemplate2 = pathname.includes('view-invoice')

//     const handleTemplateChange = (template: 1 | 2) => {
//         if (!encodedId) return

//         if (template === 1) {
//             router.push(`/sales/invoice/new-invoice/${encodedId}`)
//         } else {
//             router.push(`${ROUTES.view_invoice}/${encodedId}`)
//         }
//     }

//     // ✅ Change 4 - cached data props ma pass karya
//     const PrintInvoice = ({ copyLabel }: { copyLabel: string }) => {
//         if (isTemplate1) {
//             return (
//                 <NewInvoice
//                     copyLabel={copyLabel}
//                     invoiceId={encodedId}
//                     initialCompanyData={cachedCompanyData}
//                     initialInvoiceData={cachedInvoiceData}
//                 />
//             )
//         }

//         if (isTemplate2) {
//             return (
//                 <PreviewInvoice
//                     copyLabel={copyLabel}
//                     invoiceId={encodedId}
//                     // initialCompanyData={cachedCompanyData}
//                     // initialInvoiceData={cachedInvoiceData}
//                 />
//             )
//         }

//         return null
//     }

//     const sanitizePrintImages = () => {
//         const root = printContainerRef.current
//         if (!root) return

//         const images = Array.from(root.querySelectorAll('img'))

//         images.forEach((img) => {
//             const rawSrc = img.getAttribute('src')
//             const safeSrc = rawSrc?.trim()

//             if (!safeSrc) {
//                 img.removeAttribute('src')
//                 img.style.display = 'none'
//                 return
//             }

//             img.style.display = ''
//         })
//     }

//     const waitForImagesToLoad = async () => {
//         const root = printContainerRef.current
//         if (!root) return

//         const images = Array.from(root.querySelectorAll('img')).filter((img) => {
//             const src = img.getAttribute('src')?.trim()
//             return !!src
//         })

//         await Promise.all(
//             images.map((img) => {
//                 return new Promise<void>((resolve) => {
//                     if (img.complete && img.naturalWidth > 0) {
//                         resolve()
//                         return
//                     }

//                     const done = () => {
//                         img.removeEventListener('load', done)
//                         img.removeEventListener('error', done)
//                         resolve()
//                     }

//                     img.addEventListener('load', done, { once: true })
//                     img.addEventListener('error', done, { once: true })
//                 })
//             })
//         )
//     }

//     const handlePrint = useReactToPrint({
//         contentRef: printContainerRef,
//         documentTitle: 'Invoice',
//         pageStyle: `
//             @page {
//                 size: A4 portrait;
//                 margin: 8mm;
//             }

//             @media print {
//                 html, body {
//                     margin: 0 !important;
//                     padding: 0 !important;
//                     background: #ffffff !important;
//                     -webkit-print-color-adjust: exact;
//                     print-color-adjust: exact;
//                 }

//                 .invoice-print-page {
//                     width: 210mm !important;
//                     min-height: 297mm !important;
//                     box-sizing: border-box !important;
//                     overflow: hidden !important;
//                     page-break-inside: avoid !important;
//                     break-inside: avoid !important;
//                 }

//                 table, tr, td, th, thead, tbody {
//                     page-break-inside: avoid !important;
//                     break-inside: avoid !important;
//                 }

//                 img {
//                     max-width: 100% !important;
//                     display: block !important;
//                 }
//             }
//         `,
//         onBeforePrint: async () => {
//             sanitizePrintImages()
//             await wait(300)
//             await waitForImagesToLoad()
//             await wait(300)
//         },
//         onAfterPrint: () => {
//             setIsPreparingPrint(false)
//             setIsPrintReady(false)
//         },
//         onPrintError: (errorLocation, error) => {
//             console.error('Print error:', errorLocation, error)
//             setIsPreparingPrint(false)
//             setIsPrintReady(false)
//         }
//     })

//     const startPrint = () => {
//         if (dontShowAgain) {
//             localStorage.setItem('skipPrintPopup', 'true')
//         }

//         setShowPrintModal(false)
//         setIsPrintReady(false)
//         setIsPreparingPrint(true)
//         setPrintTrigger(prev => prev + 1)
//     }

//     useEffect(() => {
//         if (!isPreparingPrint) return

//         let cancelled = false

//         const prepare = async () => {
//             await wait(1200)
//             if (cancelled) return

//             sanitizePrintImages()
//             await waitForImagesToLoad()
//             if (cancelled) return

//             setIsPrintReady(true)
//         }

//         prepare()

//         return () => {
//             cancelled = true
//         }
//     }, [isPreparingPrint, printTrigger, selectedCopies])

//     useEffect(() => {
//         if (!isPrintReady) return

//         const doPrint = async () => {
//             await handlePrint()
//         }

//         doPrint()
//     }, [isPrintReady, handlePrint])

//     return (
//         <>
//             <div className="h-full flex flex-col bg-white">
//                 <div className="px-4 py-3 border-b">
//                     <h2 className="text-sm font-semibold">Invoice Actions</h2>
//                     <p className="text-xs text-gray-500">Manage layout & output</p>
//                 </div>

//                 <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
//                     <div>
//                         <div className="flex items-center gap-2 mb-3 text-gray-700">
//                             <LayoutTemplate size={16} />
//                             <h3 className="text-sm font-medium">Change Template</h3>
//                         </div>

//                         <div className="space-y-2">
//                             <button
//                                 onClick={() => handleTemplateChange(1)}
//                                 className={`w-full flex justify-between px-3 py-2 border rounded-md ${
//                                     isTemplate1 ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
//                                 }`}
//                             >
//                                 <span className="text-sm">Template 1</span>
//                                 {isTemplate1 && <span className="h-2 w-2 bg-blue-600 rounded-full" />}
//                             </button>

//                             <button
//                                 onClick={() => handleTemplateChange(2)}
//                                 className={`w-full flex justify-between px-3 py-2 border rounded-md ${
//                                     isTemplate2 ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
//                                 }`}
//                             >
//                                 <span className="text-sm">Template 2</span>
//                                 {isTemplate2 && <span className="h-2 w-2 bg-blue-600 rounded-full" />}
//                             </button>
//                         </div>
//                     </div>

//                     <div>
//                         <div className="flex items-center gap-2 mb-3 text-gray-700">
//                             <Printer size={16} />
//                             <h3 className="text-sm font-medium">Print</h3>
//                         </div>

//                         <button
//                             onClick={() =>
//                                 localStorage.getItem('skipPrintPopup') === 'true'
//                                     ? startPrint()
//                                     : setShowPrintModal(true)
//                             }
//                             disabled={isPreparingPrint}
//                             className="w-full border rounded-md py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {isPreparingPrint ? 'Preparing Print...' : 'Print Invoice'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showPrintModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//                     <div className="w-full max-w-lg bg-white rounded-md shadow-lg">
//                         <div className="flex justify-between px-5 py-3 border-b">
//                             <h2 className="text-sm font-semibold">Number of Copies</h2>
//                             <button onClick={() => setShowPrintModal(false)}>
//                                 <X size={16} />
//                             </button>
//                         </div>

//                         <div className="px-5 py-4 space-y-4">
//                             {PRINT_OPTIONS.map(opt => (
//                                 <label key={opt.value} className="flex gap-3 cursor-pointer">
//                                     <input
//                                         type="radio"
//                                         checked={selectedCopies === opt.value}
//                                         onChange={() => setSelectedCopies(opt.value)}
//                                         className="mt-1"
//                                     />
//                                     <div>
//                                         <p className="text-sm font-medium">{opt.title}</p>
//                                         <p className="text-xs text-gray-500">{opt.desc}</p>
//                                     </div>
//                                 </label>
//                             ))}

//                             <label className="flex items-center gap-2 cursor-pointer pt-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={dontShowAgain}
//                                     onChange={(e) => setDontShowAgain(e.target.checked)}
//                                 />
//                                 <span className="text-sm text-gray-600">Don&apos;t show again</span>
//                             </label>
//                         </div>

//                         <div className="flex justify-end px-5 py-3 border-t gap-2">
//                             <button
//                                 onClick={() => setShowPrintModal(false)}
//                                 className="px-4 py-1.5 border rounded-md text-sm"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={startPrint}
//                                 disabled={isPreparingPrint}
//                                 className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
//                             >
//                                 {isPreparingPrint ? 'Preparing...' : 'Print'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div
//                 style={{
//                     position: 'absolute',
//                     left: '-99999px',
//                     top: 0,
//                     width: '210mm',
//                     zIndex: -1,
//                     pointerEvents: 'none',
//                     opacity: 0
//                 }}
//             >
//                 <div ref={printContainerRef}>
//                     {isPreparingPrint &&
//                         Array.from({ length: selectedCopies }).map((_, i) => (
//                             <div
//                                 key={`${printTrigger}-${i}`}
//                                 className="invoice-print-page"
//                                 style={{
//                                     width: '210mm',
//                                     minHeight: '297mm',
//                                     boxSizing: 'border-box',
//                                     overflow: 'hidden',
//                                     pageBreakAfter: i === selectedCopies - 1 ? 'auto' : 'always'
//                                 }}
//                             >
//                                 <PrintInvoice copyLabel={getCopyLabel(i)} />
//                             </div>
//                         ))}
//                 </div>
//             </div>
//         </>
//     )
// }

// export default InvoiceRightSidebar

'use client'

import { useInvoicePrint } from '@/context/InvoicePrintContext'
import { Printer, LayoutTemplate, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { ROUTES } from '../constants/routes'
import NewInvoice from './InvoiceView'
import PreviewInvoice from './view_invoice'
import { getCompanyById } from '@/app/(pages)/dashboard-page/dashboard'
import { getAllInvoiceById, InvoiceData } from '../(pages)/sales/invoice/generate-invoice/generate-invoice'
import { CompanyData } from '@/app/organization/main-dashboard/company-list'
import { decodeId } from '@/app/utils/hash-service'

const PRINT_OPTIONS = [
    { value: 1, title: 'One Copy', desc: 'An original copy will be printed.' },
    { value: 2, title: 'Two Copies', desc: 'A supplier copy and a recipient copy will be printed.' },
    { value: 3, title: 'Three Copies', desc: 'A supplier copy, a transporter copy, and a recipient copy will be printed.' },
    { value: 4, title: 'Four Copies', desc: 'One additional copy will be printed.' },
    { value: 5, title: 'Five Copies', desc: 'Two additional copies will be printed.' }
]

const getCopyLabel = (index: number) => {
    switch (index) {
        case 0: return 'Original for Recipient'
        case 1: return 'Duplicate for Transporter'
        case 2: return 'Triplicate for Supplier'
        case 3: return 'QUADRUPLICATE'
        case 4: return 'QUINTUPLICATE'
        default: return `Extra Copy ${index + 1}`
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const InvoiceRightSidebar = () => {
    const { invoiceRef } = useInvoicePrint()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams()
    const encodedId = params.id as string

    const [showPrintModal, setShowPrintModal] = useState(false)
    const [selectedCopies, setSelectedCopies] = useState(3)
    const [dontShowAgain, setDontShowAgain] = useState(false)
    const [isPreparingPrint, setIsPreparingPrint] = useState(false)
    const [isPrintReady, setIsPrintReady] = useState(false)
    const [printTrigger, setPrintTrigger] = useState(0)
    const [cachedCompanyData, setCachedCompanyData] = useState<CompanyData | undefined>()
    const [cachedInvoiceData, setCachedInvoiceData] = useState<InvoiceData | undefined>()

    const printContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const companyId = localStorage.getItem('selectedCompanyId')
                if (companyId) {
                    const res = await getCompanyById(companyId)
                    if (res.success) setCachedCompanyData(res.data)
                }
                if (encodedId) {
                    const decryptedId = decodeId(encodedId) ?? ''
                    if (decryptedId) {
                        const res = await getAllInvoiceById({ id: decryptedId })
                        if (res.success) setCachedInvoiceData(res.data)
                    }
                }
            } catch (e) {
                console.error('Failed to pre-fetch print data', e)
            }
        }
        fetchData()
    }, [encodedId])

    const isTemplate1 = pathname.includes('new-invoice')
    const isTemplate2 = pathname.includes('view-invoice')

    const handleTemplateChange = (template: 1 | 2) => {
        if (!encodedId) return
        if (template === 1) {
            router.push(`/sales/invoice/new-invoice/${encodedId}`)
        } else {
            router.push(`${ROUTES.view_invoice}/${encodedId}`)
        }
    }

    const PrintInvoice = ({ copyLabel }: { copyLabel: string }) => {
        if (isTemplate1) {
            return (
                <NewInvoice
                    copyLabel={copyLabel}
                    invoiceId={encodedId}
                    initialCompanyData={cachedCompanyData}
                    initialInvoiceData={cachedInvoiceData}
                />
            )
        }
        if (isTemplate2) {
            return (
                <PreviewInvoice
                    copyLabel={copyLabel}
                    invoiceId={encodedId}
                    initialCompanyData={cachedCompanyData}
                    initialInvoiceData={cachedInvoiceData}
                />
            )
        }
        return null
    }

    const sanitizePrintImages = () => {
        const root = printContainerRef.current
        if (!root) return
        const images = Array.from(root.querySelectorAll('img'))
        images.forEach((img) => {
            const rawSrc = img.getAttribute('src')
            const safeSrc = rawSrc?.trim()
            if (!safeSrc) {
                img.removeAttribute('src')
                img.style.display = 'none'
                return
            }
            img.style.display = ''
        })
    }

    const waitForImagesToLoad = async () => {
        const root = printContainerRef.current
        if (!root) return
        const images = Array.from(root.querySelectorAll('img')).filter((img) => {
            const src = img.getAttribute('src')?.trim()
            return !!src
        })
        await Promise.all(
            images.map((img) => {
                return new Promise<void>((resolve) => {
                    if (img.complete && img.naturalWidth > 0) {
                        resolve()
                        return
                    }
                    const done = () => {
                        img.removeEventListener('load', done)
                        img.removeEventListener('error', done)
                        resolve()
                    }
                    img.addEventListener('load', done, { once: true })
                    img.addEventListener('error', done, { once: true })
                })
            })
        )
    }

    const handlePrint = useReactToPrint({
        contentRef: printContainerRef,
        documentTitle: 'Invoice',
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 8mm;
            }
            @media print {
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .invoice-print-page {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                table, tr, td, th, thead, tbody {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                img {
                    max-width: 100% !important;
                    display: block !important;
                }
            }
        `,
        onBeforePrint: async () => {
            sanitizePrintImages()
            await wait(300)
            await waitForImagesToLoad()
            await wait(300)
        },
        onAfterPrint: () => {
            setIsPreparingPrint(false)
            setIsPrintReady(false)
        },
        onPrintError: (errorLocation, error) => {
            console.error('Print error:', errorLocation, error)
            setIsPreparingPrint(false)
            setIsPrintReady(false)
        }
    })

    const startPrint = () => {
        if (dontShowAgain) {
            localStorage.setItem('skipPrintPopup', 'true')
        }
        setShowPrintModal(false)
        setIsPrintReady(false)
        setIsPreparingPrint(true)
        setPrintTrigger(prev => prev + 1)
    }

    useEffect(() => {
        if (!isPreparingPrint) return
        let cancelled = false
        const prepare = async () => {
            await wait(1200)
            if (cancelled) return
            sanitizePrintImages()
            await waitForImagesToLoad()
            if (cancelled) return
            setIsPrintReady(true)
        }
        prepare()
        return () => { cancelled = true }
    }, [isPreparingPrint, printTrigger, selectedCopies])

    useEffect(() => {
        if (!isPrintReady) return
        const doPrint = async () => { await handlePrint() }
        doPrint()
    }, [isPrintReady, handlePrint])

    const isDataLoading = !cachedCompanyData || !cachedInvoiceData

    return (
        <>
            <div className="h-full flex flex-col bg-white">
                <div className="px-4 py-3 border-b">
                    <h2 className="text-sm font-semibold">Invoice Actions</h2>
                    <p className="text-xs text-gray-500">Manage layout & output</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <LayoutTemplate size={16} />
                            <h3 className="text-sm font-medium">Change Template</h3>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleTemplateChange(1)}
                                className={`w-full flex justify-between px-3 py-2 border rounded-md ${
                                    isTemplate1 ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-sm">Mines & Minerals</span>
                                {isTemplate1 && <span className="h-2 w-2 bg-blue-600 rounded-full" />}
                            </button>
                            <button
                                onClick={() => handleTemplateChange(2)}
                                className={`w-full flex justify-between px-3 py-2 border rounded-md ${
                                    isTemplate2 ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-sm">General</span>
                                {isTemplate2 && <span className="h-2 w-2 bg-blue-600 rounded-full" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <Printer size={16} />
                            <h3 className="text-sm font-medium">Print</h3>
                        </div>
                        <button
                            onClick={() =>
                                localStorage.getItem('skipPrintPopup') === 'true'
                                    ? startPrint()
                                    : setShowPrintModal(true)
                            }
                            disabled={isPreparingPrint || isDataLoading}
                            className="w-full border rounded-md py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPreparingPrint
                                ? 'Preparing Print...'
                                : isDataLoading
                                    ? 'Loading Data...'
                                    : 'Print Invoice'}
                        </button>
                    </div>
                </div>
            </div>

            {showPrintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded-md shadow-lg">
                        <div className="flex justify-between px-5 py-3 border-b">
                            <h2 className="text-sm font-semibold">Number of Copies</h2>
                            <button onClick={() => setShowPrintModal(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            {PRINT_OPTIONS.map(opt => (
                                <label key={opt.value} className="flex gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={selectedCopies === opt.value}
                                        onChange={() => setSelectedCopies(opt.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{opt.title}</p>
                                        <p className="text-xs text-gray-500">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                />
                                <span className="text-sm text-gray-600">Don&apos;t show again</span>
                            </label>
                        </div>
                        <div className="flex justify-end px-5 py-3 border-t gap-2">
                            <button
                                onClick={() => setShowPrintModal(false)}
                                className="px-4 py-1.5 border rounded-md text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startPrint}
                                disabled={isPreparingPrint || isDataLoading}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
                            >
                                {isPreparingPrint ? 'Preparing...' : 'Print'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                style={{
                    position: 'absolute',
                    left: '-99999px',
                    top: 0,
                    width: '210mm',
                    zIndex: -1,
                    pointerEvents: 'none',
                    opacity: 0
                }}
            >
                <div ref={printContainerRef}>
                    {isPreparingPrint &&
                        Array.from({ length: selectedCopies }).map((_, i) => (
                            <div
                                key={`${printTrigger}-${i}`}
                                className="invoice-print-page"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',
                                    pageBreakAfter: i === selectedCopies - 1 ? 'auto' : 'always'
                                }}
                            >
                                <PrintInvoice copyLabel={getCopyLabel(i)} />
                            </div>
                        ))}
                </div>
            </div>
        </>
    )
}

export default InvoiceRightSidebar
