'use client'
import { InvoiceDetails } from '@/app/types/invoice'
import React, { FC, use, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import Loader from '@/app/component/Loader/Loader';
import Layout from '@/app/component/MainLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { getGSTCodeByStateName, StateWithGSTCode } from '@/app/constants/gst_code';
import { useInvoicePrint } from '@/context/InvoicePrintContext';
import { ROUTES } from '@/app/constants/routes';
import { decodeId } from '@/app/utils/hash-service';
import { CompanyData } from '../organization/main-dashboard/company-list';
import { getAllInvoiceById, InvoiceData } from '../(pages)/sales/invoice/generate-invoice/generate-invoice';
import { getCompanyById } from '../(pages)/dashboard-page/dashboard';

type Props = {
    copyLabel?: string;
    invoiceId: string;
    initialCompanyData?: CompanyData;
    initialInvoiceData?: InvoiceData;
}

const PreviewInvoice: FC<Props> = ({ copyLabel, invoiceId, initialCompanyData, initialInvoiceData }) => {

    const { invoiceRef } = useInvoicePrint()
    const router = useRouter();
    const [companyData, setCompanyData] = useState<CompanyData | undefined>(initialCompanyData);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<InvoiceData | undefined>(initialInvoiceData);
    const items = data?.items ?? [];

    // ✅ Fix - state hatavi ne directly calculate karo
    const isOutOfGujarat = (
        data?.customer?.placeOfSupplyStateName ??
        initialInvoiceData?.customer?.placeOfSupplyStateName ?? ''
    ) !== 'Gujarat'

    const handleDownload = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = invoiceRef.current;
        if (!element) return;
        window.scrollTo(0, 0);
        const preloadImages = () =>
            new Promise((resolve) => {
                const images = element.querySelectorAll('img');
                let loadedCount = 0;
                if (images.length === 0) return resolve(true);
                images.forEach((img) => {
                    if (img.complete) {
                        loadedCount++;
                        if (loadedCount === images.length) resolve(true);
                    } else {
                        img.onload = () => {
                            loadedCount++;
                            if (loadedCount === images.length) resolve(true);
                        };
                        img.onerror = () => {
                            loadedCount++;
                            if (loadedCount === images.length) resolve(true);
                        };
                    }
                });
            });
        await preloadImages();
        const opt = {
            margin: 0,
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().set(opt).from(element).save();
    };

    const hasRCM = items.some(item => item.product.unit === 'RCM');

    const handleDownloadPDF = async () => {
        const element = invoiceRef.current;
        if (!element) return;
        await new Promise((resolve) => setTimeout(resolve, 500));
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
            scrollY: -window.scrollY,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const finalImgHeight = pdfWidth / ratio;
        let position = 0;
        if (finalImgHeight > pdfHeight) {
            while (position < finalImgHeight) {
                pdf.addImage(imgData, 'PNG', 0, position * -1, pdfWidth, finalImgHeight);
                position += pdfHeight;
                if (position < finalImgHeight) pdf.addPage();
            }
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalImgHeight);
        }
        pdf.save('invoice.pdf');
    };

    useEffect(() => {
        if (!companyData) {
            getCompanyDetails();
        }
        if (invoiceId && !data) {
            getInvoiceDetails();
        }
    }, [invoiceId])

    const getInvoiceDetails = async () => {
        try {
            const decryptedId = decodeId(invoiceId) ?? '';
            if (decryptedId) {
                let response = await getAllInvoiceById({ id: decryptedId });
                if (response.success) {
                    setData(response.data);
                    // ✅ setIsOutOfGujarat hatavi didhu - hve computed property che
                } else {
                    toast.error(`🤔 Failed to get invoice details`, { autoClose: 2000 });
                }
            } else {
                window.location.replace('/error');
            }
        } catch { }
        finally { }
    }

    const getCompanyDetails = async () => {
        setIsLoading(true);
        const id = localStorage.getItem('selectedCompanyId');
        if (!id) {
            throw new Error("Company ID is missing in localStorage");
        }
        try {
            let response = await getCompanyById(id);
            if (response.success) {
                setCompanyData(response.data)
            } else {
                toast.error(`🤔 Data Not Found`, { autoClose: 2000 });
            }
        } catch {
            toast.error('Company Data Not Found!');
        } finally {
            setIsLoading(false);
        }
    }

    const totalGstTaxAmount = (Number(data?.totalCgst) || 0) + (Number(data?.totalSgst) || 0);

    const numberToWords = (amount: number): string => {
        if (isNaN(amount) || amount == null) return 'Zero Rupees';
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const inWords = (n: number): string => {
            if (n === 0) return 'Zero';
            if (n < 20) return a[n];
            if (n < 100) return `${b[Math.floor(n / 10)]} ${a[n % 10]}`.trim();
            if (n < 1000) return `${a[Math.floor(n / 100)]} Hundred ${inWords(n % 100)}`.trim();
            if (n < 100000) return `${inWords(Math.floor(n / 1000))} Thousand ${inWords(n % 1000)}`.trim();
            if (n < 10000000) return `${inWords(Math.floor(n / 100000))} Lakh ${inWords(n % 100000)}`.trim();
            return `${inWords(Math.floor(n / 10000000))} Crore ${inWords(n % 10000000)}`.trim();
        };
        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);
        let result = '';
        if (rupees > 0) result += `${inWords(rupees)} Rupee${rupees > 1 ? 's' : ''}`;
        if (paise > 0) {
            if (result) result += ' and ';
            result += `${inWords(paise)} Paise`;
        }
        return result || 'Zero Rupees';
    };

    const totalTaxAmount = (Number(data?.totalCgst) || 0) + (Number(data?.totalSgst) || 0);
    const totalTaxInWords = numberToWords(totalTaxAmount);
    const totalAmountInWords = numberToWords(data?.grandTotal ?? 0)

    const gstGroupedTotals = data?.items?.reduce((acc, row) => {
        let gst = parseFloat(row.product.gstPercent.replace('%', '') || '0');
        if (isNaN(gst)) gst = 0;
        if (!acc[gst]) {
            acc[gst] = {
                taxableAmount: 0,
                cgstPercent: isOutOfGujarat ? 0 : gst / 2,
                sgstPercent: isOutOfGujarat ? 0 : gst / 2,
                igstPercent: isOutOfGujarat ? gst : 0,
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 0
            }
        }
        const taxable = row.taxableAmount || 0;
        acc[gst].taxableAmount += taxable;
        if (isOutOfGujarat) {
            acc[gst].igstAmount += (taxable * gst) / 100;
        } else {
            acc[gst].cgstAmount += (taxable * (gst / 2)) / 100;
            acc[gst].sgstAmount += (taxable * (gst / 2)) / 100;
        }
        return acc;
    }, {} as Record<number, {
        taxableAmount: number,
        cgstPercent: number,
        sgstPercent: number,
        igstPercent: number;
        cgstAmount: number,
        sgstAmount: number,
        igstAmount: number,
    }>);

    if (gstGroupedTotals) {
        for (const key in gstGroupedTotals) {
            const group = gstGroupedTotals[Number(key)];
            group.cgstAmount = (group.taxableAmount * group.cgstPercent) / 100;
            group.sgstAmount = (group.taxableAmount * group.sgstPercent) / 100;
            group.igstAmount = (group.taxableAmount * group.igstPercent) / 100;
        }
        const finalTotal = Object.values(gstGroupedTotals).reduce(
            (sum, group) => sum + group.taxableAmount + group.cgstAmount + group.sgstAmount + group.igstAmount,
            0
        );
        console.log("Final total:", finalTotal);
    }

    function formatDate(dateString: string): string {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    const getMiningRows = (item: any) => {
        const isMining =
            item?.product?.miningProduct === true ||
            item?.product?.miningProduct === 'Yes'
        if (!isMining) return []
        const qty = Number(item.quantity)
        const royaltyRate = Number(item.product.royalty)
        const dmfRate = Number(item.product.dmf)
        const nmetRate = Number(item.product.nmet)
        if (!qty || (!royaltyRate && !dmfRate && !nmetRate)) return []
        return [
            { label: 'Royalty', rate: royaltyRate, value: qty * royaltyRate },
            { label: 'DMF', rate: dmfRate, value: qty * dmfRate },
            { label: 'NMET', rate: nmetRate, value: qty * nmetRate }
        ]
    }

    return (
        <div>
            <div className='p-5'>
                <div className="text-black">
                    <div ref={invoiceRef} className='invoice-print-root'>
                        <div ref={invoiceRef} className="max-w-4xl mx-auto p-6 bg-white">
                            <div className='flex items-stretch justify-between border'>
                                <div className="w-1/3 flex justify-center items-center">
                                    {companyData?.logo === null ?
                                        <img src='/assets/images/logo.png' alt="Company Logo" className="h-10 w-auto object-contain" />
                                        :
                                        <img src={companyData?.logo} alt="Company Logo" className="h-24 w-auto object-contain" />
                                    }
                                </div>
                                <div className="w-2/3 px-3 py-3 border-l border-gray-300 text-sm">
                                    <h1 className='text-xl font-bold text-amber-600'>{companyData?.companyName}</h1>
                                    {companyData?.billingAddress1 ?? ''}, {companyData?.billingAddress2 ?? ''}, {companyData?.billingAddress3 ?? ''} <br />
                                    {companyData?.billingCityName ?? ''} - {companyData?.billingPincode}<br />
                                    PH NO. 0286- 2265777 <br />
                                    <strong>GSTIN:</strong> {companyData?.gstNumber} <br />
                                    {`${companyData?.billingStateName || ''} (${getGSTCodeByStateName(companyData?.billingStateName?.toString() || '') || 'N/A'})`}
                                </div>
                            </div>
                            <div className='w-full justify-between px-3 py-1 flex border text-base'>
                                <label className='font-bold opacity-0'>Type</label>
                                <label className='font-bold'>Tax Invoice</label>
                                {copyLabel ?? 'Original for Recipient'}
                            </div>
                            <div className="grid grid-cols-2 text-sm border border-collapse">
                                <div className='px-3 py-1.5 text-xs'>
                                    <strong>Invoice No: </strong> {data?.invoicePrefix}{data?.invoiceNumber} <br />
                                    <strong>Invoice Date: </strong> {formatDate(data?.invoiceDate || '')} <br />
                                    <strong>Terms: </strong>{data?.terms} <br />
                                    <strong>Due Date: </strong> {formatDate(data?.dueDate || '')}
                                </div>
                                <div className="px-3 py-1 border-l border-gray-300">
                                    <p>
                                        <span className="font-bold">Place Of Supply:</span> {data?.customer.placeOfSupplyStateName} {`(${getGSTCodeByStateName(data?.customer?.placeOfSupplyStateName?.toString() || '') || 'N/A'})`}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 border-r border-l text-xs">
                                <div className="px-3 py-1.5">
                                    <p className="font-bold mb-1">Bill To</p>
                                    <p>
                                        <span className="font-bold cursor-pointer" onClick={() => router.push(ROUTES.view_customer + "?id=" + data?.customer.customerId)}>{data?.customer.customerCompanyName}</span>
                                        <br />
                                        {data?.customer?.billingAddressLine1 + ' ' + data?.customer.billingAddressLine2}
                                        <br />
                                        {data?.customer.billingCityName}
                                        <br />
                                        {data?.customer.billingStateName + ' ' + data?.customer.billingPincode}
                                        <br />
                                        India
                                    </p>
                                </div>
                                <div className="px-3 border-l border-gray-300 py-1">
                                    <p className="font-bold mb-1">Ship To</p>
                                    <p>
                                        <span className="font-bold cursor-pointer" onClick={() => router.push(ROUTES.view_customer + "?id=" + data?.customer.customerId)}>{data?.customer.customerCompanyName}</span>
                                        <br />
                                        {data?.customer?.shippingAddressLine1 + ' ' + data?.customer.shippingAddressLine2}
                                        <br />
                                        {data?.customer.shippingCityName}
                                        <br />
                                        {data?.customer.shippingStateName + ' ' + data?.customer.shippingPincode}
                                        <br />
                                        India
                                    </p>
                                </div>
                            </div>
                            <div className='w-full border p-1 text-xs'>
                                Whether the tax is payable on reverse charge mechanism ('RCM') ? :
                                <span className='font-bold ml-1'>{data?.isRCM ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="border border-gray-300 overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr className="border border-gray-300">
                                            <th className="border p-2 text-center">#</th>
                                            <th className="border p-2 text-center">Item & Description</th>
                                            <th className="border p-2 text-center">HSN / SAC</th>
                                            <th className="border p-2 text-center">Qty</th>
                                            <th className="border p-2 text-center">Unit</th>
                                            <th className="border p-2 text-center">Rate</th>
                                            <th className="border p-2 text-center">GST %</th>
                                            <th className="border p-2 text-left">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.items.map((item, index) => {
                                            const miningRows = getMiningRows(item)
                                            return (
                                                <React.Fragment key={index}>
                                                    <tr className="border">
                                                        <td className="p-2 border-r text-center">{index + 1}</td>
                                                        <td className="p-2 border-r font-medium">{item.product.productName}</td>
                                                        <td className="p-2 border-r text-center">{item.product.hsnCode ?? item.product.sacCode}</td>
                                                        <td className="p-2 border-r text-right">{item.quantity}</td>
                                                        <td className="p-2 border-r text-center">{item.product.unit}</td>
                                                        <td className="p-2 border-r text-right">{Number(item.rate).toFixed(2)}</td>
                                                        <td className="p-2 border-r text-right">{item.product.gstPercent}</td>
                                                        <td className="p-2 text-right">{Number(item.taxableAmount).toFixed(2)}</td>
                                                    </tr>
                                                    {miningRows.map((row, i) => (
                                                        <tr key={i} className="border">
                                                            <td className="px-2 border-r"></td>
                                                            <td className="x-2 border-r pl-6 italic">{row.label}</td>
                                                            <td className="px-2 border-r"></td>
                                                            <td className="px-2 border-r text-right"></td>
                                                            <td className="px-2 border-r text-center"></td>
                                                            <td className="px-2 border-r text-right">{Number(row.rate).toFixed(2)}</td>
                                                            <td className="px-2 border-r"></td>
                                                            <td className="px-2 text-right">{Number(row.value).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    {Array.from({ length: 1 }).map((_, i) => (
                                                        <tr className="border-gray-300" key={`empty-${i}`}>
                                                            <td className="px-2 border-r text-center">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                            <td className="px-2 border-r">&nbsp;</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-3">
                                <div className="col-span-2 border">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-2 text-sm"> </th>
                                                <th className="p-2 text-center" colSpan={2}>Central</th>
                                                <th className="p-2 text-center" colSpan={2}>State/UT</th>
                                                <th className='p-2 text-center' colSpan={2}>Integrated</th>
                                            </tr>
                                            <tr>
                                                <th className="p-2">Amount</th>
                                                <th className="p-2">Rate</th>
                                                <th className="p-2">Amount</th>
                                                <th className="p-2">Rate</th>
                                                <th className="p-2">Amount</th>
                                                <th className='p-2'>Rate</th>
                                                <th className='p2'>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(gstGroupedTotals ?? {}).map(([gstRate, datas]) => (
                                                <tr key={gstRate}>
                                                    <td className="p-2">{datas.taxableAmount.toFixed(2)}</td>
                                                    <td className="p-2">{datas.cgstPercent}%</td>
                                                    <td className="p-2">{datas.cgstAmount.toFixed(2)}</td>
                                                    <td className="p-2">{datas.sgstPercent}%</td>
                                                    <td className="p-2">{datas.sgstAmount.toFixed(2)}</td>
                                                    <td className='p-2'>{datas.igstPercent}%</td>
                                                    <td className='p-2'>{datas.igstAmount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-span-1 border border-gray-300 p-3 text-xs overflow-x-auto">
                                    <div className="flex justify-between text-xs text-gray-800">
                                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Taxable Amount:</h4>
                                        <div className='text-sm'>{data?.totalTaxableAmount.toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="flex justify-between text-gray-800">
                                        <div>IGST</div>
                                        <div>{data?.totalIgst.toFixed(2)}</div>
                                    </div>
                                    <div className="flex justify-between text-gray-800">
                                        <div>CGST</div>
                                        <div>{data?.totalCgst.toFixed(2)}</div>
                                    </div>
                                    <div className="flex justify-between text-gray-800 mt-1">
                                        <div>SGST</div>
                                        <div>{data?.totalSgst.toFixed(2)}</div>
                                    </div>
                                    <div className="flex justify-between text-gray-800 mt-2">
                                        <div>Round Off</div>
                                        <div>{data?.roundOff.toFixed(2)}</div>
                                    </div>
                                    {data?.otherCharge !== null && data?.otherCharge.map((charges, index) => (
                                        <div className="flex justify-between text-gray-800 mt-2" key={index}>
                                            <div>{charges.label}</div>
                                            <div>{charges.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 text-xs">
                                <div className="col-span-2 border px-3 py-1 space-y-2">
                                    <div className="">
                                        <p><span className="font-semibold">Total GST :    </span> {totalTaxInWords}</p>
                                    </div>
                                    <div className="">
                                        <p><span className="font-bold text-xs">Bill Amount:    </span>{totalAmountInWords}</p>
                                    </div>
                                </div>
                                <div className="border border-gray-300 col-span-1 py-1 px-3 overflow-x-auto">
                                    <div className="flex justify-between text-sm text-gray-800">
                                        <div className='font-bold'>Grand Total</div>
                                        <div className='font-bold'>{data?.grandTotal.toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-8 px-3 py-1 leading-relaxed border-l border-r min-h-[4rem]">
                                <p className="font-semibold mb-1 text-xs">Narration :</p>
                                <p className='text-xs'>{data?.narration}</p>
                                <br />
                            </div>
                            <div className="w-full flex justify-between mt-2 text-xs border">
                                <p className='w-2/3 p-2'>
                                    Terms & Conditions : <br />
                                    {data?.customer.terms}
                                </p>
                                <div className="text-right w-1/3 p-2 whitespace-nowrap">
                                    <p>For {companyData?.companyName}</p>
                                    <p className="mt-10">Authorised Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewInvoice
