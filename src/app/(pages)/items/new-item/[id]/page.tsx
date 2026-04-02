// 'use client';
// import { FC, use, useEffect, useState } from 'react';
// import CustomLabel from '@/app/component/label';
// import Layout from '@/app/component/layout';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import { addNewItem, AddNewItemReq, fetchSingleItem, updateNewItem } from '../../items';
// import { toast } from 'react-toastify';
// import { Loader } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';
// import { decodeId } from '@/app/utils/hash-service';

// interface AddNewItemProps {
//   isModalOpen?: boolean;
//   onClick?: () => void;
//   params: Promise<{ id: string }>;
// }

// const AddNewItem: FC<AddNewItemProps> = ({ isModalOpen = false, onClick, params }) => {
//   const [itemType, setItemType] = useState('Goods');
//   const unitOptions = ['gm', 'kg', 'mg', 'ltr', 'mt', 'ml', 'piece', 'pack', 'box', 'dozen', 'meter', 'cm', 'inch', 'per minute', 'Ton'];
//   const taxPreference = ['Taxable', 'Non-Taxable', 'Out of Scope', 'Non-GST Supply'];
//   const taxPer = ['0%', '5%', '12%', '18%', '28%']
//   const validationSchema = Yup.object().shape({
//     name: Yup.string().required('Item name is required'),
//     hsnCode: Yup.string().required(
//       `${itemType === 'Goods' ? 'HSN' : 'SAC'} code is required`
//     ),
//     unit: Yup.string().required('Unit is required'),
//     taxPref: Yup.string().required('Tax preference is required'),
//     sellingPrice: Yup.string().required('Selling Price is required'),

//     taxPer: Yup.string().when('taxPref', {
//       is: (val: string) => val === 'Taxable',
//       then: (schema) => schema.required('Tax Percentage is required'),
//     }),

//     miningProduct: Yup.string().required(),

//     royalty: Yup.string().when('miningProduct', {
//       is: 'Yes',
//       then: (schema) => schema.required('Royalty is required'),
//     }),

//     dmf: Yup.string().when('miningProduct', {
//       is: 'Yes',
//       then: (schema) => schema.required('DMF is required'),
//     }),

//     nmet: Yup.string().when('miningProduct', {
//       is: 'Yes',
//       then: (schema) => schema.required('NMET is required'),
//     }),
//   });
//   const router = useRouter()
//   // const searchParams = useSearchParams();
//   // const id = searchParams.get("id") ?? "";
//   const resolvedParams = use(params);
//   const id = resolvedParams.id;

//   const [initialValues, setValues] = useState({
//     name: '',
//     hsnCode: '',
//     unit: '',
//     taxPref: '',
//     taxPer: '',
//     sellingPrice: '',
//     miningProduct: 'No',
//     royalty: '',
//     dmf: '',
//     nmet: '',
//   })
//   const [isLoading, setIsLoading] = useState(false);


//   async function handleUpdate(values: typeof initialValues) {
//     const orgId = localStorage.getItem('selectedCompanyId');
//     try {
//       setIsLoading(true)
//       const request: AddNewItemReq = {
//         hsnCode: itemType === 'Goods' ? values.hsnCode : '',
//         sacCode: itemType === 'Goods' ? '' : values.hsnCode,
//         productName: values.name,
//         unit: values.unit,
//         taxPreference: values.taxPref,
//         type: itemType,
//         gstPercent: values.taxPer,
//         companyId: parseInt(orgId ?? ''),
//         sellingPrice: parseFloat(values.sellingPrice),
//         miningProduct: values.miningProduct === 'Yes',
//         royalty: values.miningProduct === 'Yes' ? Number(values.royalty) : 0,
//         dmf: values.miningProduct === 'Yes' ? Number(values.dmf) : 0,
//         nmet: values.miningProduct === 'Yes' ? Number(values.nmet) : 0,
//       };

//       const reqId = decodeId(id) ?? '';
//       const res = await updateNewItem(reqId, request);
//       if (res.success) {
//         toast.success(`🎉 ${res.message}`, {
//           autoClose: 2000,
//           onClose: () => { },
//         });
//         setValues(initialValues);
//         setItemType('Goods');
//         if (isModalOpen) {
//           router.back()
//         }
//         else {
//           router.replace('/items')
//         }

//       }
//       else {
//         toast.error(`🤔 ${res.message}`, {
//           autoClose: 2000,
//         });
//       }

//     }
//     catch (error: any) {
//       toast.error(error?.message || 'Something went wrong while updating item.')
//     }
//     finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     getSingleItem();
//   }, [])

//   const getSingleItem = async () => {
//     if (id !== '') {

//       const decryptedId = decodeId(id) ?? '';

//       if (decryptedId) {
//         let res = await fetchSingleItem({ id: decryptedId });
//         if (res.success) {
//           console.log("Single Item Data ", res.data)
//           // setItemType(res.data.type)
//           // setValues({ ...initialValues, name: res.data.productName ?? '', hsnCode: res.data.type.toLowerCase() === 'Goods'.toLowerCase() ? (res.data.hsnCode ?? '') : (res.data.sacCode ?? ''), taxPref: res.data.taxPreference, unit: res.data.unit, taxPer: res.data.gstPercent?.toString() ?? '', sellingPrice: res.data.sellingPrice.toString() })

//           setItemType(res.data.type)

//           setValues({
//             name: res.data.productName ?? '',
//             hsnCode:
//               res.data.type === 'Goods'
//                 ? res.data.hsnCode ?? ''
//                 : res.data.sacCode ?? '',
//             unit: res.data.unit ?? '',
//             taxPref: res.data.taxPreference ?? '',
//             taxPer: res.data.gstPercent?.toString() ?? '',
//             sellingPrice: res.data.sellingPrice?.toString() ?? '',

//             // ✅ mining fields
//             miningProduct: res.data.miningProduct ? 'Yes' : 'No',
//             royalty: res.data.royalty?.toString() ?? '',
//             dmf: res.data.dmf?.toString() ?? '',
//             nmet: res.data.nmet?.toString() ?? '',
//           })
//         } else {
//           toast.error(`🤔 ${'Something went wrong. Please try again!'}`, {
//             autoClose: 2000,
//           });
//         }
//       }
//       else{
//         window.location.replace('/error');
//       }
//     }

//   }

//   return (

//     <div className='w-full flex flex-col items-center py-1'>
//       {isLoading && (
//         <div className="fixed top-0 left-0 w-full h-full bg-white/50 flex items-center justify-center z-50">
//           <Loader className="animate-spin h-10 w-10 text-blue-500" />
//         </div>
//       )}
//       <h1 className="text-3xl font-bold text-center text-black mb-10 mt-10">{id !== '' ? 'Edit' : 'Add'} New Item</h1>
//       <div className='min-w-[25%] border rounded-md bg-white p-5 mb-5 space-y-4 text-black'>
//         <div className="flex items-center gap-3">
//           <div className="min-w-[100px]">
//             <CustomLabel title="Type" />
//           </div>
//           <label className="flex items-center gap-1">
//             <input
//               type="radio"
//               name="itemType"
//               value="Goods"
//               checked={itemType === 'Goods'}
//               onChange={(e) => setItemType(e.target.value)}
//               className='accent-red-600'
//             />
//             Goods
//           </label>
//           <label className="flex items-center gap-1">
//             <input
//               type="radio"
//               name="itemType"
//               value="Service"
//               checked={itemType === 'Service'}
//               onChange={(e) => setItemType(e.target.value)}
//               className='accent-red-600'
//             />
//             Service
//           </label>
//         </div>

//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleUpdate}
//           enableReinitialize
//         >
//           {({ handleChange, values, setFieldValue }) => (
//             <Form className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title="Item Name" isCompulsory />
//                 </div>
//                 <div className="flex-1">
//                   {/* <Field
//                       name="name"
//                       type="text"
//                       onChange={handleChange}
//                       className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
//                     /> */}
//                   <input type='text' name='name' value={values.name} onChange={handleChange} className='w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm' />
//                   <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title={itemType === 'Goods' ? 'HSN Code' : 'SAC Code'} isCompulsory />
//                 </div>
//                 <div className="flex-1">
//                   {/* <Field
//                       name="hsnCode"
//                       type="text"
//                       onChange={handleChange}
//                       className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
//                     /> */}
//                   <input type="text" name='hsnCode' value={values.hsnCode} onChange={handleChange} className='w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm' />
//                   <ErrorMessage name="hsnCode" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title={'Selling Price'} isCompulsory />
//                 </div>
//                 <div className="flex-1">
//                   {/* <Field
//                       name="sellingPrice"
//                       type="text"
//                       onChange={handleChange}
//                       className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm"
//                     /> */}

//                   <input
//                     type="text"
//                     name="sellingPrice"
//                     value={values.sellingPrice}
//                     onChange={handleChange}
//                     className="w-full rounded-md border border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 bg-white focus:ring-red-300 text-sm"
//                   />                  <ErrorMessage name="sellingPrice" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title="Unit" isCompulsory />
//                 </div>
//                 <div className="flex-1">
//                   <select
//                     value={values.unit}
//                     name="unit"
//                     onChange={handleChange}
//                     className="w-full rounded-md border border-gray-300 py-1 bg-white px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
//                   >
//                     <option value="">Select Unit</option>
//                     {unitOptions.map((unit, index) => (
//                       <option key={index} value={unit}>{unit}</option>
//                     ))}
//                   </select>
//                   <ErrorMessage name="unit" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title="Tax Preference" isCompulsory />
//                 </div>
//                 <div className="flex-1">
//                   <select
//                     value={values.taxPref}
//                     name="taxPref"
//                     onChange={handleChange}
//                     className="w-full rounded-md border bg-white border-gray-300 py-1 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
//                   >
//                     <option value="">Select Tax Preference</option>
//                     {taxPreference.map((tax, index) => (
//                       <option key={index} value={tax}>{tax}</option>
//                     ))}
//                   </select>
//                   <ErrorMessage name="taxPref" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>
//               {values.taxPref.toLowerCase() === 'taxable' && (<div className="flex items-center gap-3">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title="Tax %" />
//                 </div>
//                 <div className="flex-1">
//                   <select
//                     value={values.taxPer}
//                     name="taxPer"
//                     onChange={handleChange}
//                     className="w-full rounded-md border border-gray-300 py-2 px-2 text-gray-900 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 sm:text-sm"
//                   >
//                     <option value="">Select Tax Percentage</option>
//                     {taxPer.map((tax, index) => (
//                       <option key={index} value={tax}>{tax}</option>
//                     ))}
//                   </select>
//                   <ErrorMessage name="taxPer" component="div" className="text-red-500 text-sm" />
//                 </div>
//               </div>)}
//               <div className="flex items-center gap-3 text-sm">
//                 <div className="min-w-[100px]">
//                   <CustomLabel title="Mining Product" />
//                 </div>
//                 <div className="flex-1">
//                   <select
//                     name="miningProduct"
//                     value={values.miningProduct}
//                     onChange={handleChange}
//                     className="w-full rounded-md border bg-white border-gray-300 py-1 px-2"
//                   >
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                   </select>
//                 </div>
//               </div>
//               {values.miningProduct === 'Yes' && (
//                 <>
//                   {/* Royalty */}
//                   <div className="flex items-center gap-3 text-sm">
//                     <div className="min-w-[100px]">
//                       <CustomLabel title="Royalty " />
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         name="royalty"
//                         value={values.royalty}
//                         onChange={(e) => {
//                           const royalty = Number(e.target.value || 0);

//                           setFieldValue('royalty', e.target.value);
//                           setFieldValue('dmf', (royalty * 0.30).toFixed(2));   // 30%
//                           setFieldValue('nmet', (royalty * 0.02).toFixed(2));  // 2%
//                         }}
//                         className="w-full rounded-md border py-1 px-2 bg-white"
//                       />

//                       <ErrorMessage name="royalty" component="div" className="text-red-500 text-sm" />
//                     </div>
//                   </div>

//                   {/* DMF */}
//                   <div className="flex items-center gap-3 text-sm">
//                     <div className="min-w-[100px]">
//                       <CustomLabel title="DMF" />
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         name="dmf"
//                         value={values.dmf}
//                         onChange={handleChange}
//                         className="w-full rounded-md border py-1 px-2 bg-white"
//                       />
//                       <ErrorMessage name="dmf" component="div" className="text-red-500 text-sm" />
//                     </div>
//                   </div>

//                   {/* NMET */}
//                   <div className="flex items-center gap-3 text-sm">
//                     <div className="min-w-[100px]">
//                       <CustomLabel title="NMET" />
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         name="nmet"
//                         value={values.nmet}
//                         onChange={handleChange}
//                         className="w-full rounded-md border py-1 px-2 bg-white"
//                       />
//                       <ErrorMessage name="nmet" component="div" className="text-red-500 text-sm" />
//                     </div>
//                   </div>
//                 </>
//               )}
//               <div className="w-full flex items-center justify-center gap-5 pt-4">
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
//                 >
//                   {id !== '' ? 'Update' : 'Submit'}
//                 </button>
//                 <button
//                   type="reset"
//                   className="w-full md:w-auto bg-[#03508C] text-white hover:bg-[#0874CB] px-6 py-2 rounded-lg font-medium shadow-lg"
//                   onClick={() => {
//                     if (isModalOpen) {
//                       onClick?.();
//                     }
//                     else {
//                       router.replace('/items')
//                     }
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </div>

//   );
// };

// export default AddNewItem;

// page.tsx
import AddNewItemClient from '@/app/component/AddNewItemClient';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>; // Define params as a Promise
}) {
  const resolvedParams = await params; // Await the promise here
  
  return <AddNewItemClient id={resolvedParams.id} />;
}