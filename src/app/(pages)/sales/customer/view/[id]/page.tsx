'use client';
import Layout from '@/app/component/MainLayout';
import { useSearchParams } from 'next/navigation';
import React, { FC, use, useEffect, useState } from 'react'
import Loader from '@/app/component/Loader/Loader';
import TextField from '@/app/component/inputfield';
import ViewCard from '@/app/component/view_card';
import { ROUTES } from '@/app/constants/routes';
import { CustomerData, getCustomerById } from '../../customer';
import { decodeId, encodeId } from '@/app/utils/hash-service';

interface CustomerViewProps {
  params: Promise<{ id: string }>
}

const CustomerView: FC<CustomerViewProps> = ({ params }) => {
  const [customerData, setCustomerData] = useState<CustomerData>()
  // const searchParams = useSearchParams();
  // const id = searchParams.get('id') ?? '';
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (id !== '') {


      getCustomerDetails();
    }
  }, [])

  const getCustomerDetails = async () => {
    setIsLoading(true);
    const decryptedId = decodeId(id) ?? '';
    if (decryptedId) {
      try {

        const res = await getCustomerById({ id: decryptedId });
        if (res.success) {
          setCustomerData(res.data);
        } else {
          alert('Customer Details Not Found!')
        }
      }
      catch { }
      finally {
        setIsLoading(false);
      }
    }
    else {
      window.location.replace('/error');
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader isInside />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold text-center text-black mb-8">
        View Customer Detail
      </h1>

      <div className="w-full border rounded-md bg-white p-5">

        {/* BASIC DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <ViewCard label="Customer Type" value={customerData?.customerType ?? ''} />
          <ViewCard
            label="Full Name"
            value={`${customerData?.salutation ?? ''} ${customerData?.firstName ?? ''} ${customerData?.lastName ?? ''}`}
          />
          <ViewCard label="Company Name" value={customerData?.customerCompanyName} />
          <ViewCard label="Display Name" value={customerData?.displayName} />
          <ViewCard label="Email" value={customerData?.email} />
          <ViewCard label="Work Phone" value={customerData?.workPhone} />
          <ViewCard label="Mobile Number" value={customerData?.mobileNumber} />
          <ViewCard label="PAN Number" value={customerData?.pan} />
          <ViewCard label="GST Number" value={customerData?.gstNumber} />
          <ViewCard label="Place Of Supply" value={customerData?.placeOfSupplyStateName} />
          <ViewCard label="VID" value={customerData?.vid} />
        </div>

        {/* CONTACT PERSON */}
        {customerData?.contactPersons &&
          customerData.contactPersons.length > 0 && (
            <div className="w-full mb-4">
              <h3 className="text-base mb-2 underline">Contact Person</h3>

              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-2">Salutation</th>
                      <th className="px-4 py-2">First Name</th>
                      <th className="px-4 py-2">Last Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Work Phone</th>
                      <th className="px-4 py-2">Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.contactPersons.map((contact: any, index: number) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{contact.salutation}</td>
                        <td className="px-4 py-2">{contact.firstName}</td>
                        <td className="px-4 py-2">{contact.lastName}</td>
                        <td className="px-4 py-2">{contact.email}</td>
                        <td className="px-4 py-2">{contact.workPhone}</td>
                        <td className="px-4 py-2">{contact.mobileNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        <hr className="my-4" />

        {/* BILLING ADDRESS */}
        <h3 className="text-base mb-2 underline">Address</h3>

        <div className="mb-3">
          <h3 className="text-sm font-semibold mb-1">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ViewCard label="Attention" value={customerData?.billingAttention} />
            <ViewCard label="Address Line 1" value={customerData?.billingAddressLine1} />
            <ViewCard label="Address Line 2" value={customerData?.billingAddressLine2} />
            <ViewCard label="State" value={customerData?.billingStateName} />
            <ViewCard label="City" value={customerData?.billingCityName} />
            <ViewCard label="Pincode" value={customerData?.billingPincode} />
          </div>
        </div>

        {/* SHIPPING ADDRESS */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold mb-1">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ViewCard label="Attention" value={customerData?.shippingAttention} />
            <ViewCard label="Address Line 1" value={customerData?.shippingAddressLine1} />
            <ViewCard label="Address Line 2" value={customerData?.shippingAddressLine2} />
            <ViewCard label="State" value={customerData?.shippingStateName} />
            <ViewCard label="City" value={customerData?.shippingCityName} />
            <ViewCard label="Pincode" value={customerData?.shippingPincode} />
          </div>
        </div>

        <hr className="my-4" />

        {/* INVOICES */}
        <h3 className="text-base mb-2 underline">Invoices</h3>

        {customerData?.invoices &&
          customerData?.invoices.length > 0 ? (
          customerData.invoices.map((data: any, index: number) => (
            <div key={index} className="text-sm mb-1">
              Invoice{' '}
              <a
                href={`${ROUTES.new_invoice}/${encodeId(data.invoiceId)}`}
                className="text-blue-600 hover:underline"
              >
                {data.invoicePrefix} {data.invoiceNumber}
              </a>{' '}
              of amount ₹{' '}
              {data.grandTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No invoices available.</p>
        )}

      </div>
    </div>
  )

}

export default CustomerView