'use client'
import { CompanyData } from '@/app/organization/main-dashboard/company-list';
import { useInvoicePrint } from '@/context/InvoicePrintContext';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'
import { getCompanyById } from '@/app/(pages)/dashboard-page/dashboard';
import { toast } from 'react-toastify';
import { getGSTCodeByStateName } from '@/app/constants/gst_code';
import { ROUTES } from '@/app/constants/routes';
import { de } from 'date-fns/locale';
import { decodeId } from '@/app/utils/hash-service';
import { getAllInvoiceById, InvoiceData } from '../(pages)/sales/invoice/generate-invoice/generate-invoice';

type InvoiceProps = {
    copyLabel?: string;
    // params?: Promise<{ id: string }>
    invoiceId: string
}

const NewInvoice = ({ copyLabel, invoiceId }: InvoiceProps) => {
    const router = useRouter();
    const { invoiceRef } = useInvoicePrint()
    const [companyData, setCompanyData] = useState<CompanyData>();
    const [isLoading, setIsLoading] = useState(false);
    // let id = '';
    // if (params) {
    //     const resolvedParams = use(params);
    //     id = resolvedParams.id;
    // }
    const [data, setData] = useState<InvoiceData>();
    const items = data?.items ?? [];
    const [isOutOfGujarat, setIsOutOfGujarat] = useState(false);

    // useEffect(() => {
    //     getCompanyDetails();
    //     if (id !== '') {
    //         getInvoiceDetails();
    //     }
    // }, [id])

    useEffect(() => {
        getCompanyDetails()
        if (invoiceId) {
            getInvoiceDetails(invoiceId)
        }
    }, [invoiceId])

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
        }
        catch {
            toast.error('Company Data Not Found!');
        }
        finally {
            setIsLoading(false);
        }
    }

    const getInvoiceDetails = async (encodedId: string) => {
        try {
            const decryptedId = decodeId(encodedId) ?? '';
            if (decryptedId) {
                let response = await getAllInvoiceById({ id: decryptedId });
                if (response.success) {
                    setData(response.data);
                    let isOutOfGT = response.data.customer.placeOfSupplyStateName !== 'Gujarat';
                    setIsOutOfGujarat(isOutOfGT);
                }
                else {
                    toast.error(`🤔 Failed to get invoice details`, { autoClose: 2000 });
                }
            } else {
                window
            }

        }
        catch { }
        finally { }
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
            {
                label: 'Royalty',
                rate: royaltyRate,
                value: qty * royaltyRate
            },
            {
                label: 'DMF',
                rate: dmfRate,
                value: qty * dmfRate
            },
            {
                label: 'NMET',
                rate: nmetRate,
                value: qty * nmetRate
            }
        ]
    }

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

        if (rupees > 0) {
            result += `${inWords(rupees)} Rupee${rupees > 1 ? 's' : ''}`;
        }

        if (paise > 0) {
            if (result) result += ' and ';
            result += `${inWords(paise)} Paise`;
        }

        return result || 'Zero Rupees';
    };

    const totalTaxAmount = (Number(data?.totalCgst) || 0) + (Number(data?.totalSgst) || 0);

    const gstGroupedTotals = data?.items?.reduce((acc, row) => {
        let gst = parseFloat(row.product.gstPercent.replace('%', '') || '0');
        if (isNaN(gst)) gst = 0;
        console.log("GST PERCENTAGE = ", gst)
        if (!acc[gst]) {
            // acc[gst] = {
            //     taxableAmount: 0,
            //     cgstPercent: gst / 2,
            //     sgstPercent: gst / 2,
            //     cgstAmount: 0,
            //     sgstAmount: 0,
            // };

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
        }
        else {
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


    const calculateTotalGstPercentages = (
        gstGroupedTotals: Record<number, {
            taxableAmount: number,
            cgstPercent: number,
            sgstPercent: number,
            igstPercent: number,
            cgstAmount: number,
            sgstAmount: number,
            igstAmount: number,
        }>
    ) => {
        let totalTaxable = 0
        let totalCgstAmount = 0
        let totalSgstAmount = 0
        let totalIgstAmount = 0

        Object.values(gstGroupedTotals).forEach(row => {
            totalTaxable += row.taxableAmount
            totalCgstAmount += row.cgstAmount
            totalSgstAmount += row.sgstAmount
            totalIgstAmount += row.igstAmount
        })

        const totalCgstPercent =
            totalTaxable > 0 ? (totalCgstAmount / totalTaxable) * 100 : 0

        const totalSgstPercent =
            totalTaxable > 0 ? (totalSgstAmount / totalTaxable) * 100 : 0

        const totalIgstPercent =
            totalTaxable > 0 ? (totalIgstAmount / totalTaxable) * 100 : 0

        const totalGstPercent =
            totalCgstPercent + totalSgstPercent + totalIgstPercent

        return {
            totalTaxable,
            totalCgstAmount,
            totalSgstAmount,
            totalIgstAmount,
            totalCgstPercent,
            totalSgstPercent,
            totalIgstPercent,
            totalGstPercent
        }
    }
    const gstTotals = gstGroupedTotals
        ? calculateTotalGstPercentages(gstGroupedTotals)
        : null


    const totalGstAmount =
        (gstTotals?.totalCgstAmount || 0) +
        (gstTotals?.totalSgstAmount || 0) +
        (gstTotals?.totalIgstAmount || 0)

    const totalAmount =
        (data?.totalTaxableAmount || 0) + totalGstAmount

    const roundOff = data?.roundOff || 0

    const grandTotalCalculated =
        totalAmount + roundOff
    const totalTaxInWords = numberToWords(totalGstAmount);
    const totalAmountInWords = numberToWords(grandTotalCalculated)
    return (
        <div className=' p-5'>
            <div ref={invoiceRef} className="invoice-print-root">
                <div className="max-w-4xl mx-auto bg-white  p-6">

                    <div className="flex border mb-2 min-h-[110px]">
                        <div className="w-1/3 flex items-center justify-center">
                            {companyData?.logo === null ?
                                <img
                                    src='/assets/images/logo.png'
                                    alt="Company Logo"
                                    className="h-10 w-auto object-contain"
                                />
                                :
                                <img
                                    src={companyData?.logo}
                                    //src='/assets/images/logo.png'
                                    alt="Company Logo"
                                    className="h-24 w-auto object-contain"
                                />}
                        </div>
                        <div className="w-2/3 px-4 py-2 flex flex-col">

                            <div className="text-right">
                                <h1 className="text-lg font-bold text-amber-600 underline leading-tight">
                                    {companyData?.companyName}
                                </h1>
                            </div>

                            <div className="flex-1 flex items-center justify-end text-sm p-1">
                                <p className="text-right">
                                    {companyData?.billingAddress1 ?? ''}, {companyData?.billingAddress2 ?? ''} <br />
                                    {companyData?.billingAddress3 ?? ', '}, {companyData?.billingCityName ?? ''} ({companyData?.billingStateName ?? ''})<br />
                                    <span className='italic'>Email - {companyData?.email ?? ''}</span> <br />
                                    <span className='italic'>Mo.: - {companyData?.mobileNumber ?? ''}, {companyData?.alternateMobileNumber ?? ''}</span>

                                </p>

                            </div>

                        </div>
                    </div>
                    <div className="w-full border mb-2">
                        <div className="flex">
                            <div className="w-1/2 border-r text-center py-1">
                                <h2 className="font-bold  text-xs">
                                    Tax Invoice
                                </h2>
                            </div>
                            <div className="w-1/2 text-center py-1">
                                <h2 className="font-bold text-xs">
                                    {copyLabel ?? 'Original for Recipient'}
                                </h2>

                            </div>

                        </div>
                    </div>

                    <div className='w-full m-auto mb-2 border text-xs'>
                        <div className='grid grid-cols-2'>
                            <div className="border-r p-2">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="min-w-[120px] font-medium whitespace-nowrap">GSTN</td>
                                            <td className="px-2">:</td>
                                            <td className="break-all">{companyData?.gstNumber ?? ''}</td>
                                        </tr>

                                        <tr>
                                            <td className="font-medium align-top whitespace-nowrap">
                                                State name &amp; code
                                            </td>
                                            <td className="px-2 align-top">:</td>
                                            <td>
                                                <div className="flex flex-wrap">
                                                    <span className="min-w-[90px] font-medium whitespace-nowrap">
                                                        State Code
                                                    </span>
                                                    <span className="px-2">:</span>
                                                    <span>{getGSTCodeByStateName(companyData?.billingStateName.toString() || '') || 'N/A'}</span>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                <div className="flex flex-wrap">
                                                    <span className="min-w-[90px] font-medium whitespace-nowrap">
                                                        State Name
                                                    </span>
                                                    <span className="px-2">:</span>
                                                    <span>{companyData?.billingStateName}</span>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Range</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.range ?? '-'}</td>
                                        </tr>

                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Division</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.division ?? '-'}</td>
                                        </tr>

                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Commissionerate</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.commissionerate ?? '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                            <div className='p-2'>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="min-w-[120px] font-medium whitespace-nowrap">PAN No.</td>
                                            <td className="px-2">:</td>
                                            <td>{companyData?.panNumber ?? '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium whitespace-nowrap">CIN</td>
                                            <td className="px-2">:</td>
                                            <td>{companyData?.cinNumber ?? '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Invoice No.</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.invoicePrefix}-{data?.invoiceNumber ?? '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Invoice Date</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.invoiceDate ?? '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium whitespace-nowrap">Transport</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.transport ?? '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium whitespace-nowrap">L.R. No.</td>
                                            <td className="px-2">:</td>
                                            <td>{data?.lrNumber ?? '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className='w-full m-auto mb-2 border text-xs'>
                        <div className='grid grid-cols-2'>
                            <div className='border-r px-2 py-1'>
                                <p className='font-medium mb-1 text-xs text-center'>Bill To Party</p>
                                <div>
                                    <span className="font-bold cursor-pointer" onClick={() => router.push(ROUTES.view_customer + "?id=" + data?.customer.customerId)}>{data?.customer.customerCompanyName}</span>
                                    <br />
                                    {data?.customer.billingAddressLine1}, {data?.customer.billingAddressLine2}, {data?.customer.billingCityName}, ({data?.customer.billingStateName})
                                    <br />
                                    <br />
                                    <span className='font-bold'>GSTN : {data?.customer.gstNumber ?? '-'}</span>
                                    <br />
                                    <span className='font-bold'>PAN : {data?.customer.pan ?? '-'}</span>
                                    <div className="w-full">
                                        <div className="flex">
                                            <div className="w-1/2 text-center py-1">
                                                <h2 className="text-start">
                                                    STATE CODE : {getGSTCodeByStateName(data?.customer.billingStateName ?? '') || 'N/A'}
                                                </h2>
                                            </div>
                                            <div className="w-1/2 text-center py-1">
                                                <h2 className=" text-start">
                                                    STATE NAME : {data?.customer.billingStateName ?? 'N/A'}
                                                </h2>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='px-2 py-1'>
                                <p className='font-medium mb-1 text-xs text-center'>Delivery Address</p>
                                <p>
                                    <span className="font-bold cursor-pointer" onClick={() => router.push(ROUTES.view_customer + "?id=" + data?.customer.customerId)}>{data?.customer.customerCompanyName}</span>
                                    <br />
                                    {data?.customer.shippingAddressLine1}, {data?.customer.shippingAddressLine2}, {data?.customer.shippingCityName}, ({data?.customer.shippingStateName})

                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='w-full border p-1 text-xs mb-2'>
                        Whether the tax is payable on reverse charge mechanism ('RCM') ? :
                        <span className='font-bold ml-1'>
                            {data?.isRCM ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className='w-full text-sm overflow-x-auto mb-2'>
                        <table className="w-full border-collapse border text-xs">

                            {/* ITEM TABLE HEADER */}
                            <thead>
                                <tr className='bg-gray-100 text-xs'>
                                    <th className="border p-2 w-5">Sr. No</th>
                                    <th className="border p-2 w-14">HSN</th>
                                    <th className="border p-2">Description of Goods</th>
                                    <th className="border p-2 w-24">Quantity</th>
                                    <th className="border p-2 w-12">UQC</th>
                                    <th className='border p-2 w-24 text-center'>Value per Unit</th>
                                    <th className="border p-2 w-28">Amount</th>
                                </tr>
                            </thead>

                            {/* ITEM ROWS */}
                            <tbody>
                                {
                                    data?.items.map((item, index) => {
                                        const miningRows = getMiningRows(item);

                                        return (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td className='px-2 text-start border'>
                                                        {index + 1}
                                                    </td>
                                                    <td className='text-end px-2 border'>
                                                        {item.product.hsnCode ?? item.product.sacCode}
                                                    </td>
                                                    <td className='border px-2'>
                                                        {item.product.productName}
                                                    </td>
                                                    <td className='text-end px-2 border'>{item.quantity}</td>
                                                    <td className='text-center px-2 border'>{item.product.unit}</td>
                                                    <td className='text-end border px-2'>{Number(item.rate).toLocaleString('en-In', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}</td>
                                                    <td className='px-2 border text-end'>{Number(item.taxableAmount).toLocaleString('en-In', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}</td>
                                                </tr>
                                                {
                                                    miningRows.map((row, i) => (
                                                        <tr key={i} className='border'>
                                                            <td className='px-2 border'></td>
                                                            <td className='px-2 border'></td>
                                                            <td className='border px-2'>{row.label}</td>
                                                            <td className='px-2 border'></td>
                                                            <td className='px-2 border'></td>
                                                            <td className='text-end border px-2'>{Number(row.rate).toLocaleString('en-In', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}</td>
                                                            <td className='px-2 border text-end'>{Number(row.value).toLocaleString('en-In', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}</td>
                                                        </tr>
                                                    ))
                                                }
                                                {Array.from({ length: 1 }).map((_, i) => (
                                                    <tr className=" border-gray-300" key={`empty-${i}`}>
                                                        <td className="px-2 border-r text-center">&nbsp;</td>
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
                                    })
                                }

                                <tr>
                                    <td colSpan={2} rowSpan={3} className='border p-2 text-xs'>Total GST payable amount in words</td>
                                    <td className='border p-2 text-xs' rowSpan={3}>{totalTaxInWords}</td>
                                    <td className="border text-right" colSpan={2}>Total Taxable Value</td>
                                    <td className="border text-right">-</td>
                                    <td className="border text-right font-extrabold">{data?.totalTaxableAmount.toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}>SGST</td>
                                    <td className="border text-right">{gstTotals?.totalSgstPercent.toFixed(2)}%</td>
                                    <td className="border text-right">{data?.totalSgst.toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}>CGST</td>
                                    <td className="border text-right">{gstTotals?.totalCgstPercent.toFixed(2)}%</td>
                                    <td className="border text-right">{data?.totalCgst.toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} rowSpan={5} className='border p-2 text-xs'>Total amount in words</td>
                                    <td className='border p-2 text-xs' rowSpan={5}>{totalAmountInWords}</td>
                                    <td className="border text-right" colSpan={2}>IGST</td>
                                    <td className="border text-right">{gstTotals?.totalIgstPercent.toFixed(2)}%</td>
                                    <td className="border text-right">{data?.totalIgst.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}>TOTAL GST</td>
                                    <td className="border text-right">{gstTotals?.totalGstPercent.toFixed(2)}%</td>
                                    <td className="border text-right font-extrabold">{(gstTotals?.totalCgstAmount! +
                                        gstTotals?.totalSgstAmount! +
                                        gstTotals?.totalIgstAmount!).toLocaleString('en-In', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}>TOTAL</td>
                                    <td className="border text-right">-</td>
                                    <td className="border text-right font-extrabold"> {totalAmount.toLocaleString('en-In', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}></td>
                                    <td className="border text-right">-</td>
                                    <td className="border text-right">{data?.roundOff.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border text-right" colSpan={2}>GRAND TOTAL</td>
                                    <td className="border text-right">-</td>
                                    <td className="border font-extrabold text-right">  {grandTotalCalculated.toLocaleString('en-In', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    <div className='w-full text-sm overflow-x-auto mb-2'>
                        <table className="w-full border-collapse border text-sm">
                            <tbody>
                                <tr className='border'>
                                    <td className='p-1 text-xs' colSpan={2}>Remarks:</td>

                                </tr>
                                <tr>
                                    <td className='w-4 p-1 border text-xs'>1</td>
                                    <td className='p- text-xs border font-bold'>Period: From {data?.invoiceDate} to {data?.dueDate}</td>
                                </tr>
                                <tr>
                                    <td className='border p-2.5'></td>
                                    <td className='border p-2.5'></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-full flex justify-between mt-2 text-xs border">
                        <p className='border-r w-2/3 p-2'>
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
    );

}

export default NewInvoice