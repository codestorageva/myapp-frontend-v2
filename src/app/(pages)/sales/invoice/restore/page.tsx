'use client'
import Layout from '@/app/component/MainLayout'
import React, { JSX, useEffect, useState } from 'react'
// import { getAllInvoice, InvoiceData } from '../../generate-invoice/generate-invoice';
import { useRouter } from 'next/navigation';
import DataTable, { TableColumn } from 'react-data-table-component';
import { IoSearchSharp } from 'react-icons/io5';
import Loader from '@/app/component/Loader/Loader';
import { ROUTES } from '@/app/constants/routes';
import Image from 'next/image';
import { noDataFound } from '@/app/utils/path'
import CustomButton from '@/app/component/buttons/CustomButton';
import Colors from '@/app/utils/colors';
import { encodeId } from '@/app/utils/hash-service';
import { toast } from 'react-toastify';
import DeleteRestoreModal from '@/app/component/modal';
import { GetAllParams } from '@/app/(pages)/items/items';
import { deleteInvoice, getAllDeletedInvoice, getAllInvoice, InvoiceData, restoreInvoice } from '../generate-invoice/generate-invoice';
import { GoSync } from 'react-icons/go';
export interface DataRow {
    no: number;
    invoiceNumber: string;
    action: JSX.Element;
}

const ViewInvoice = () => {

    const [dataRows, setDataRows] = useState<DataRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [invoiceListData, setInvoiceData] = useState<InvoiceData[]>([]);
    const [searchData, setSearchTableData] = useState('');
    const router = useRouter();
    const [restoreCustomerId, setRestoreCustomerId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getAll();
    }, []);

    const param: Partial<GetAllParams> = {
        sortDirection: 'asc',
        isDeleted: true
    }

    const headerColumn: TableColumn<DataRow>[] = [
        {
            name: 'NO',
            selector: (row) => row.no.toString(),
            sortable: true,
            width: '100px',
        },
        {
            name: 'INVOICE NUMBER',
            selector: (row) => row.invoiceNumber,
            sortable: true,
            cell: (row) => (
                <span
                    onClick={() => {
                        const encodedId = encodeId(row.no);
                        router.push(`/sales/invoice/new-invoice/${encodedId}`);
                        // router.push(`${ROUTES.view_invoice}/${encodedId}`);
                    }}
                    className='cursor-pointer text-blue-600'
                >
                    {row.invoiceNumber}
                </span>
            ),
        },
        {
            name: 'Action',
            width: '100PX',
            cell: (row: any) => (
                <div className="flex flex-col items-center justify-center">
                    <button className="bg-transparent border-none cursor-pointer" onClick={() => { setRestoreCustomerId(row.no); setIsModalOpen(true) }}>
                        <GoSync size={18} color={Colors.gradient1} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    const handleShow = () => setIsModalOpen(true);

    const handleClose = () => {
        setIsModalOpen(false);
    }

    const restoreSingleState = async () => {
        if (restoreCustomerId) {
            let res = await restoreInvoice(restoreCustomerId);
            if (res.success) {
                getAll();
                toast.success(`🎉 ${res.message}`, {
                    autoClose: 2000,
                });
            }
            else {
                toast.error(`🤔 ${res.message}`, { autoClose: 2000 })
            }
        }
        handleClose();
    }

    const getAll = async () => {
        try {
            setIsLoading(true);
            const localCompanyId = localStorage.getItem('selectedCompanyId') ?? '';
            const res = await getAllDeletedInvoice(localCompanyId);
            if (res.success) {
                const formattedData: DataRow[] = res.data.map((invoice: InvoiceData) => ({
                    no: invoice.invoiceId,
                    invoiceNumber: invoice.invoicePrefix + " " + invoice.invoiceNumber,
                    action: <button onClick={() => { }}></button>
                }))
                setDataRows(formattedData);
            }
            else {
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

    const filteredData = dataRows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(searchData.toLowerCase()));

    return (

        <div className="relative w-full h-full p-5">
            <div className='relative flex flex-col w-full h-full'>
                <h1 className="text-3xl font-bold text-center text-black mb-10">Deleted Invoice Details</h1>
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
                            name="Back"
                            // type="submit"
                            type="button"
                            onClick={() => {
                                router.back();
                            }}
                            className="previous-btn mt-3 mb-2 "
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
                            data={filteredData}
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
                    onclick={restoreSingleState}
                    onHide={handleClose}
                    closeNoBtn={handleClose}
                    okBtn={handleClose}
                    hasPermissionChanged={false}
                    isSoftDeletePage
                />
            </div>
        </div>


    )
}

export default ViewInvoice

