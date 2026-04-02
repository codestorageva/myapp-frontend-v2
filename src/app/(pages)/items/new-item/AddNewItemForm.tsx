'use client';
import { FC, useState } from 'react';
import CustomLabel from '@/app/component/label';
import { Formik, Form,ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addNewItem, AddNewItemReq } from '../items';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddNewItemProps {
  isModalOpen?: boolean;
  onClick?: () => void;
}

const AddNewItem: FC<AddNewItemProps> = ({ isModalOpen = false, onClick }) => {
  const [itemType, setItemType] = useState('Goods');
  const unitOptions = ['gm', 'kg', 'mg', 'ltr', 'mt', 'ml', 'piece', 'pack', 'box', 'dozen', 'meter', 'cm', 'inch', 'per minute', 'Ton'];
  const taxPreference = ['Taxable', 'Non-Taxable', 'Out of Scope', 'Non-GST Supply'];
  const taxPer = ['0%', '5%', '12%', '18%', '28%']
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Item name is required'),
    hsnCode: Yup.string().required(
      `${itemType === 'Goods' ? 'HSN' : 'SAC'} code is required`
    ),
    unit: Yup.string().required('Unit is required'),
    taxPref: Yup.string().required('Tax preference is required'),
    sellingPrice: Yup.string().required('Selling Price is required'),

    taxPer: Yup.string().when('taxPref', {
      is: (val: string) => val === 'Taxable',
      then: (schema) => schema.required('Tax Percentage is required'),
    }),

    miningProduct: Yup.string().required(),

    royalty: Yup.string().when('miningProduct', {
      is: 'Yes',
      then: (schema) => schema.required('Royalty is required'),
    }),

    dmf: Yup.string().when('miningProduct', {
      is: 'Yes',
      then: (schema) => schema.required('DMF is required'),
    }),

    nmet: Yup.string().when('miningProduct', {
      is: 'Yes',
      then: (schema) => schema.required('NMET is required'),
    }),
  });
  const router = useRouter()
  // const searchParams = useSearchParams();
  // const id = searchParams.get("id") ?? "";
 
  const [initialValues, setValues] = useState({
    name: '',
    hsnCode: '',
    unit: '',
    taxPref: '',
    taxPer: '',
    sellingPrice: '',
    miningProduct: 'No',
    royalty: '',
    dmf: '',
    nmet: '',
  })
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: typeof initialValues) {
    const companyId = localStorage.getItem('selectedCompanyId');
    setIsLoading(true);
    try {
      const request: AddNewItemReq = {
        hsnCode: itemType === 'Goods' ? values.hsnCode : '',
        sacCode: itemType === 'Goods' ? '' : values.hsnCode,
        productName: values.name,
        unit: values.unit,
        taxPreference: values.taxPref,
        type: itemType,
        gstPercent: values.taxPer,
        companyId: parseInt(companyId ?? ''),
        sellingPrice: parseFloat(values.sellingPrice),
        miningProduct: values.miningProduct === 'Yes',
        royalty: values.miningProduct === 'Yes' ? Number(values.royalty) : 0,
        dmf: values.miningProduct === 'Yes' ? Number(values.dmf) : 0,
        nmet: values.miningProduct === 'Yes' ? Number(values.nmet) : 0,
      };
      console.log("request data ", request)
      const res = await addNewItem(request);
      if (res?.success) {
        toast.success(`🎉 ${res.message}`, {
          autoClose: 2000,
          onClose: () => { },
        });
        setValues(initialValues)
        setItemType('Goods');
        if (isModalOpen) {
          onClick?.();
        }
        else {
          router.replace('/items')
        }

      } else {
        toast.error(`🤔 ${res.message}`, {
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      console.error("Submit error: ", error);
      toast.error(error?.message || 'Something went wrong while adding item.');
    } finally {
      setIsLoading(false);
    }
  };

  

 

  return (

    <div className='w-full flex flex-col items-center py-1  px-10'>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/50 flex items-center justify-center z-50">
          <Loader className="animate-spin h-10 w-10 text-blue-500" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-center text-black mb-10 mt-10">{'Add'} New Item</h1>
      <div className='min-w-[25%] border rounded-md bg-white p-5 mb-5 space-y-4 text-black'>
        <div className="flex items-center gap-3">
          <div className="min-w-[100px]">
            <CustomLabel title="Type" />
          </div>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="itemType"
              value="Goods"
              checked={itemType === 'Goods'}
              onChange={(e) => setItemType(e.target.value)}
              className='accent-red-600'
            />
            Goods
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="itemType"
              value="Service"
              checked={itemType === 'Service'}
              onChange={(e) => setItemType(e.target.value)}
              className='accent-red-600'
            />
            Service
          </label>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <CustomLabel title="Item Name" isCompulsory />
                </div>
                <div className="flex-1">
                  {/* <Field
                      name="name"
                      type="text"
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
                    /> */}
                  <input type='text' name='name' value={values.name} onChange={handleChange} className='w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm' />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <CustomLabel title={itemType === 'Goods' ? 'HSN Code' : 'SAC Code'} isCompulsory />
                </div>
                <div className="flex-1">
                  {/* <Field
                      name="hsnCode"
                      type="text"
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
                    /> */}
                  <input type="text" name='hsnCode' value={values.hsnCode} onChange={handleChange} className='w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm' />
                  <ErrorMessage name="hsnCode" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <CustomLabel title={'Selling Price'} isCompulsory />
                </div>
                <div className="flex-1">
                  {/* <Field
                      name="sellingPrice"
                      type="text"
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
                    /> */}

                  <input
                    type="text"
                    name="sellingPrice"
                    value={values.sellingPrice}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 bg-white focus:ring-red-300 text-sm"
                  />                  <ErrorMessage name="sellingPrice" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <CustomLabel title="Unit" isCompulsory />
                </div>
                <div className="flex-1">
                  <select
                    value={values.unit}
                    name="unit"
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map((unit, index) => (
                      <option key={index} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <ErrorMessage name="unit" component="div" className="text-red-500 text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-[100px]">
                  <CustomLabel title="Tax Preference" isCompulsory />
                </div>
                <div className="flex-1">
                  <select
                    value={values.taxPref}
                    name="taxPref"
                    onChange={handleChange}
                    className="w-full rounded-md border bg-white border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
                  >
                    <option value="">Select Tax Preference</option>
                    {taxPreference.map((tax, index) => (
                      <option key={index} value={tax}>{tax}</option>
                    ))}
                  </select>
                  <ErrorMessage name="taxPref" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              {values.taxPref.toLowerCase() === 'taxable' && (<div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <CustomLabel title="Tax %" />
                </div>
                <div className="flex-1">
                  <select
                    value={values.taxPer}
                    name="taxPer"
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
                  >
                    <option value="">Select Tax Percentage</option>
                    {taxPer.map((tax, index) => (
                      <option key={index} value={tax}>{tax}</option>
                    ))}
                  </select>
                  <ErrorMessage name="taxPer" component="div" className="text-red-500 text-sm" />
                </div>
              </div>)}
              <div className="flex items-center gap-3 text-sm">
                <div className="min-w-[100px]">
                  <CustomLabel title="Mining Product" />
                </div>
                <div className="flex-1">
                  <select
                    name="miningProduct"
                    value={values.miningProduct}
                    onChange={handleChange}
                    className="w-full rounded-md border bg-white border-gray-300 py-1 px-2"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              {values.miningProduct === 'Yes' && (
                <>
                  {/* Royalty */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="min-w-[100px]">
                      <CustomLabel title="Royalty " />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="royalty"
                        value={values.royalty}
                        onChange={(e) => {
                          const royalty = Number(e.target.value || 0);

                          setFieldValue('royalty', e.target.value);
                          setFieldValue('dmf', (royalty * 0.30).toFixed(2));   // 30%
                          setFieldValue('nmet', (royalty * 0.02).toFixed(2));  // 2%
                        }}
                        className="w-full rounded-md border py-1 px-2 bg-white"
                      />

                      <ErrorMessage name="royalty" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* DMF */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="min-w-[100px]">
                      <CustomLabel title="DMF" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="dmf"
                        value={values.dmf}
                        onChange={handleChange}
                        className="w-full rounded-md border py-1 px-2 bg-white"
                      />
                      <ErrorMessage name="dmf" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* NMET */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="min-w-[100px]">
                      <CustomLabel title="NMET" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="nmet"
                        value={values.nmet}
                        onChange={handleChange}
                        className="w-full rounded-md border py-1 px-2 bg-white"
                      />
                      <ErrorMessage name="nmet" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>
                </>
              )}
              <div className="w-full flex items-center justify-center gap-5 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
                >
                  {'Submit'}
                </button>
                <button
                  type="reset"
                  className="w-full md:w-auto bg-[#03508C] text-white hover:bg-[#0874CB] px-6 py-2 rounded-lg font-medium shadow-lg"
                  onClick={() => {
                    if (isModalOpen) {
                      onClick?.();
                    }
                    else {
                      router.replace('/items')
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>

  );
};

export default AddNewItem;
