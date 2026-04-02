'use client'
import Layout from '@/app/component/MainLayout'
import React, { JSX, useEffect, useMemo, useState } from 'react'
// import { getAllInvoice, InvoiceData } from '../../generate-invoice/generate-invoice';
import { useRouter } from 'next/navigation';
import DataTable, { TableColumn } from 'react-data-table-component';
import { GetAllParams } from '../../items/items';
import { IoSearchSharp } from 'react-icons/io5';
import Loader from '@/app/component/Loader/Loader';
import { ROUTES } from '@/app/constants/routes';
import Image from 'next/image';
import { noDataFound } from '@/app/utils/path'
import CustomButton from '@/app/component/buttons/CustomButton';
import Colors from '@/app/utils/colors';
import { encodeId } from '@/app/utils/hash-service';
import { deleteInvoice, getAllInvoice, InvoiceData } from './generate-invoice/generate-invoice';
import { toast } from 'react-toastify';
import DeleteRestoreModal from '@/app/component/modal';
import { SummeryReportData } from '../../reports/reports';
import { table } from 'console';
// export interface DataRow {
//     no: number;
//     invoiceNumber: string;
//     action: JSX.Element;
// }

export interface DataRow {
    no: number;
    date: string;
    particulars: string;
    invoiceId: number;
    invoiceType: string;
    invoiceNumber: string;
    quantity: number;
    material: string;
    value: string;
    royaltyValue: string;
    dmf: string;
    nmet: string;
    totalTaxableValue: string;
    sgst: string;
    cgst: string;
    igst: string;
    total: string;
    roundOff: string;
    grandTotal: string;
    paymentReceived: string;
    closingBalance: string;
    isTotal?: boolean;
    action: JSX.Element;
}

const ViewInvoice = () => {

    const [dataRows, setDataRows] = useState<DataRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [invoiceListData, setInvoiceData] = useState<InvoiceData[]>([]);
    const [searchData, setSearchTableData] = useState('');
    const router = useRouter();
    const [deleteCustomerId, setCustomerId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        getAll();
    }, []);

    const totalCellClass = (row: DataRow) =>
        row.isTotal ? "font-bold text-black" : "";
    const param: Partial<GetAllParams> = {
        sortDirection: 'asc',
    }

    const headerColumn: TableColumn<DataRow>[] = [
        {
            name: 'NO',
            selector: (row) => row.no.toString(),
            sortable: true,
            width: '100px',
            cell: (row) => (
                <span className={totalCellClass(row)}>
                    {row.isTotal ? "Total" : row.no}
                </span>
            ),
        },
        {
            name: "Date",
            selector: (row) => row.date,
            sortable: true,
            width: "110px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.isTotal ? "" : row.date}
                </span>
            ),
        },
        {
            name: "Particulars",
            selector: (row) => row.particulars,
            sortable: true,
            grow: 2,
            width: "180px",
            wrap: true,
            cell: (row) => (
                <span className={totalCellClass(row)}>
                    {row.isTotal ? "" : row.particulars}
                </span>
            ),
        },
        {
            name: "Invoice ID",
            selector: (row) => row.invoiceId,
            sortable: true,
            width: "110px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.isTotal ? "" : row.invoiceId}
                </span>
            ),
        },
        {
            name: "Invoice Type",
            selector: (row) => row.invoiceType,
            sortable: true,
            width: "120px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.isTotal ? "" : row.invoiceType || "Sales"}
                </span>
            ),
        },
        {
            name: "Invoice No.",
            selector: (row) => row.invoiceNumber,
            sortable: true,
            width: "150px",
            cell: (row) =>
                row.isTotal ? (
                    <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}></span>
                ) : (
                    <span
                        onClick={() => {
                            const encodedId = encodeId(row.invoiceId);
                            router.push(`/sales/invoice/new-invoice/${encodedId}`);
                        }}
                        className="cursor-pointer text-blue-600"
                    >
                        {row.invoiceNumber}
                    </span>
                ),
        },
        {
            name: "Material",
            selector: (row) => row.material,
            sortable: true,
            grow: 2,
            width: "200px",
            cell: (row) => <span className={totalCellClass(row)}>{row.material}</span>,
        },
        {
            name: "Qty",
            selector: (row) => row.quantity,
            sortable: true,
            width: "100px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.isTotal
                        ? row.quantity.toLocaleString("en-IN")
                        : row.quantity
                            ? row.quantity.toLocaleString("en-IN")
                            : ""}
                </span>
            ),
        },
        {
            name: "Value",
            selector: (row) => parseAmount(row.value),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.value}
                </span>
            ),
        },
        {
            name: "Royalty",
            selector: (row) => parseAmount(row.royaltyValue),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.royaltyValue}
                </span>
            ),
        },
        {
            name: "DMF",
            selector: (row) => parseAmount(row.dmf),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.dmf}
                </span>
            ),
        },
        {
            name: "NMET",
            selector: (row) => parseAmount(row.nmet),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.nmet}
                </span>
            ),
        },
        {
            name: "Taxable Value",
            selector: (row) => parseAmount(row.totalTaxableValue),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.totalTaxableValue}
                </span>
            ),
        },
        {
            name: "Total GST",
            selector: (row) => parseAmount(row.sgst),
            sortable: true,
            width: "120px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {(parseFloat(row.sgst) + parseFloat(row.cgst) + parseFloat(row.igst)).toFixed(2)}
                </span>
            ),
        },
        // {
        //     name: "CGST",
        //     selector: (row) => parseAmount(row.cgst),
        //     sortable: true,
        //     width: "120px",
        //     cell: (row) => (
        //         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
        //             {row.cgst}
        //         </span>
        //     ),
        // },
        // {
        //     name: "IGST",
        //     selector: (row) => parseAmount(row.igst),
        //     sortable: true,
        //     width: "150px",
        //     cell: (row) => (
        //         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
        //             {row.igst}
        //         </span>
        //     ),
        // },
        {
            name: "Total",
            selector: (row) => parseAmount(row.total),
            sortable: true,
            width: "150px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.total}
                </span>
            ),
        },
        {
            name: "Round Off",
            selector: (row) => parseAmount(row.roundOff),
            sortable: true,
            width: "120px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.roundOff}
                </span>
            ),
        },
        {
            name: "Grand Total",
            selector: (row) => parseAmount(row.grandTotal),
            sortable: true,
            width: "160px",
            cell: (row) => (
                <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
                    {row.grandTotal}
                </span>
            ),
        },
        {
            name: 'Action',
            width: '120PX',
            cell: (row: any) => (
                row.isTotal ? null : (   // ✅ IMPORTANT
                    <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => {
                            const encodedId = encodeId(row.no);
                            router.push(`/sales/invoice/new-invoice/${encodedId}`);
                        }}>
                            <img src="/assets/icons/view.png" width={20} />
                        </button>

                        <button onClick={() => {
                            const secureId = encodeId(row.no);
                            router.replace(`/sales/invoice/edit-invoice/${secureId}`)
                        }}>
                            <img src='/assets/icons/edit.png' width={20} />
                        </button>

                        <button onClick={() => {
                            setCustomerId(row.no);
                            handleShow();
                        }}>
                            <img src='/assets/icons/delete.png' width={15} />
                        </button>
                    </div>
                )
            ),
            ignoreRowClick: true,
        }
    ];

    const handleShow = () => setIsModalOpen(true);

    const handleClose = () => {
        setIsModalOpen(false);
    }

    const deleteCustomer = async () => {
        if (deleteCustomerId) {
            let res = await deleteInvoice({ id: deleteCustomerId });
            if (res.success) {
                getAll();
            }
            else {
                toast.error(`🤔 ${res.message}`, {
                    autoClose: 2000,
                });
            }
            setIsModalOpen(false);
        }
    }

    const getAll = async () => {
        try {
            setIsLoading(true);
            const localCompanyId = localStorage.getItem('selectedCompanyId') ?? '';
            const res = await getAllInvoice(localCompanyId, param as GetAllParams);

            if (res.success) {
                const formattedData: DataRow[] = res.data
                    .filter((report: any) => report.date !== "Total") // 👈 ADD THIS LINE
                    .map((report: SummeryReportData, index: number) => ({
                        no: index + 1,
                        invoiceId: report.invoiceId || 0,
                        date: report.date || "",
                        particulars: report.particulars || "",
                        invoiceType: report.invoiceType || "",
                        invoiceNumber: report.invoiceNumber || "",
                        quantity: report.quantity || 0,
                        material: report.material || "",
                        value: report.value || "0.00",
                        royaltyValue: report.royaltyValue || "0.00",
                        dmf: report.dmf || "0.00",
                        nmet: report.nmet || "0.00",
                        totalTaxableValue: report.totalTaxableValue || "0.00",
                        sgst: report.sgst || "0.00",
                        cgst: report.cgst || "0.00",
                        igst: report.igst || "0.00",
                        total: report.total || "0.00",
                        roundOff: report.roundOff || "0.00",
                        grandTotal: report.grandTotal || "0.00",
                        paymentReceived: report.paymentReceived || "0.00",
                        closingBalance: report.closingBalance || "0.00",
                        narration: report.narration || "",
                        isTotal: false,
                        action: <></>
                    })
                    );

                setDataRows(formattedData);
            } else {
                setDataRows([]);
            }
        }
        catch (err: any) { }
        finally {
            setIsLoading(false);
        }
    }

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: 'rgba(117, 117, 117, 0.4)',
                color: 'black',
                fontSize: '12px',
                textAlign: 'center' as 'center',
            }
        }, headRow: {
            style: {
                textAlign: 'center' as 'center', // ✅ CORRECTED
            },
        },
    }

    // const filteredData = dataRows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(searchData.toLowerCase()));
    const filteredData = useMemo(() => {
        return dataRows.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchData.toLowerCase())
        );
    }, [dataRows, searchData]);


    const parseAmount = (val?: string): number => {
        if (!val) return 0;
        return Number(String(val).replace(/,/g, "").replace("₹", "").trim()) || 0;
    };
    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, row) => {
                if (row.isTotal) return acc;

                acc.quantity += row.quantity || 0;
                acc.value += parseAmount(row.value);
                acc.royalty += parseAmount(row.royaltyValue);
                acc.dmf += parseAmount(row.dmf);
                acc.nmet += parseAmount(row.nmet);
                acc.taxable += parseAmount(row.totalTaxableValue);
                acc.sgst += parseAmount(row.sgst);
                acc.cgst += parseAmount(row.cgst);
                acc.igst += parseAmount(row.igst);
                acc.total += parseAmount(row.total);
                acc.roundOff += parseAmount(row.roundOff);
                acc.grandTotal += parseAmount(row.grandTotal);
                acc.payment += parseAmount(row.paymentReceived);
                acc.closing += parseAmount(row.closingBalance);
                return acc;
            },
            {
                quantity: 0,
                value: 0,
                royalty: 0,
                dmf: 0,
                nmet: 0,
                taxable: 0,
                sgst: 0,
                cgst: 0,
                igst: 0,
                total: 0,
                roundOff: 0,
                grandTotal: 0,
                payment: 0,
                closing: 0,
            }
        );
    }, [filteredData]);


    const formatAmount = (value?: number): string =>
        value !== undefined && value !== null
            ? value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : "0.00";

    const totalRow: DataRow = useMemo(
        () => ({
            no: 0,
            date: "Total",
            particulars: "",
            invoiceId: 0,
            invoiceType: "",
            invoiceNumber: "",
            quantity: totals.quantity,
            material: "",
            value: formatAmount(totals.value),
            royaltyValue: formatAmount(totals.royalty),
            dmf: formatAmount(totals.dmf),
            nmet: formatAmount(totals.nmet),
            totalTaxableValue: formatAmount(totals.taxable),
            sgst: formatAmount(totals.sgst),
            cgst: formatAmount(totals.cgst),
            igst: formatAmount(totals.igst),
            total: formatAmount(totals.total),
            roundOff: formatAmount(totals.roundOff),
            grandTotal: formatAmount(totals.grandTotal),
            paymentReceived: formatAmount(totals.payment),
            closingBalance: formatAmount(totals.closing),
            narration: "",
            isTotal: true,
            action: <></>
        }),
        [totals]
    );

    const tableData = useMemo(() => {
        return [...filteredData, totalRow];
    }, [filteredData, totalRow]);

    const hasValidData = useMemo(() => {
        return filteredData.some(row => parseAmount(row.grandTotal) > 0);
    }, [filteredData]);
    return (

        <div className="relative w-full h-full p-5">
            <div className='relative flex flex-col w-full h-full'>
                <h1 className="text-3xl font-bold text-center text-black mb-10">Invoice Details</h1>
                <div className="flex items-center justify-between space-x-3">
                    <div className='py-3 relative'>
                        <input
                            type="text"
                            placeholder="Search Here ...!"
                            className="px-2 py-1 border rounded-lg text-sm placeholder:text-sm bg-white text-black"
                            style={{ borderRadius: '0.3rem' }}
                            onChange={(e) => setSearchTableData(e.target.value)}
                        />
                        <IoSearchSharp className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    </div>
                    <div className='flex space-x-3 mx-3'>

                        <CustomButton
                            name="Create Invoice"
                            className="text-white px-4 py-2 rounded-lg text-sm  border-none transition font-inter"
                            style={{ background: `linear-gradient(to right, ${Colors.gradient1}, ${Colors.gradient2})` }}
                            onClick={() => router.push(ROUTES.generate_invoice)}
                        />
                        <CustomButton
                            name="Restore"
                            className="text-white px-4 py-2 rounded-lg text-sm border-none transition font-inter shadow-md hover:shadow-lg hover:brightness-105"
                            style={{
                                background: 'linear-gradient(to right, #4b5563, #9ca3af)', // Gray-600 to Gray-400
                            }} onClick={() => router.push(ROUTES.deleted_invoices)}

                        />
                    </div>
                </div>
                <div>
                    {isLoading ? (
                        <div className="flex-grow">
                            <div className="inset-0 flex justify-center items-center">
                                <Loader isInside={true} />
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            columns={headerColumn}
                            // data={filteredData}
                            data={hasValidData ? tableData : []}
                            fixedHeader
                            customStyles={customStyles}
                            pagination
                            highlightOnHover
                            noDataComponent={
                                <div className="flex flex-col items-center justify-center py-6 w-full rounded-full">
                                    <Image
                                        src={noDataFound}
                                        alt="No Data Found"
                                        width={300}
                                        height={300}
                                        className="mb-4"
                                    />
                                </div>
                            }
                            className='font-inter rounded'

                        />
                    )}
                </div>
                <DeleteRestoreModal
                    isModalVisible={isModalOpen}
                    title="Invoice"
                    message=''
                    onclick={deleteCustomer}
                    onHide={handleClose}
                    closeNoBtn={handleClose}
                    okBtn={handleClose}
                    hasPermissionChanged={false}
                />
            </div>
        </div>


    )
}

export default ViewInvoice


// export const MyComponent = ({ data, columns }: { data: DataRow[], columns: TableColumn<DataRow>[] }) => (
//     <DataTable
//         columns={columns}
//         data={data}
//     />
// );