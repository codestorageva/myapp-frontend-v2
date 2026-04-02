import CustomLabel from '@/app/component/label'
import Colors from '@/app/utils/colors'
import React, { FC } from 'react'
import { ErrorMessage, Field } from 'formik'
import Link from 'next/link'
import PasswordInput from '@/app/component/password/PasswordInput'



const PersonalDetails: FC<any> = ({ values, handleChange, handleBlur, industries, setFieldValue, companyLogo, setFieldTouched }) => {
    return (
        <div className='w-full mb-3'>
            <div className='mt-5 grid grid-cols-3 gap-x-4 gap-y-3'>
                <div className="sm:col-span-1">
                    <CustomLabel title='Organization Name' isCompulsory />
                    <div className="mt-1">
                        <input type="text" name="companyName" autoComplete="given-name" value={values.companyName} onChange={handleChange} onBlur={handleBlur} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="companyName" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <CustomLabel title='Owner Name' isCompulsory />
                    <div className="mt-1">
                        <input type="text" name='ownerName' autoComplete="given-name" value={values.ownerName} onChange={handleChange} onBlur={handleBlur} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="ownerName" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <CustomLabel title='Organization Logo' isCompulsory />
                    <div className="mt-1">
                        {/* <input type="file" required name='logo' autoComplete="given-name" value={values.logo} onChange={handleChange} onBlur={handleBlur} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" /> */}
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={(event) => {
                                event.preventDefault();
                                const file = event.currentTarget.files?.[0];
                                if (file) {
                                    setFieldTouched('logo', true);
                                    setFieldValue('logo', file); // sets the file

                                }
                            }}
                            onBlur={handleBlur}
                            className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        />
                        {companyLogo !== null && <Link href={companyLogo} className='text-sm text-danger underline' target="_blank" rel="noopener noreferrer">Click Here</Link>}
                        <ErrorMessage name="logo" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <CustomLabel title='PAN Number' isCompulsory />
                    <div className="mt-1">
                        <input type="text" name='panNo' autoComplete="given-name" value={values.panNo} onChange={handleChange} onBlur={handleBlur} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="panNo" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <CustomLabel title='GST Number' isCompulsory />
                    <div className="mt-1">
                        <input type="text" name="gstNo" autoComplete="given-name" value={values.gstNo} onChange={handleChange} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="gstNo" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className='sm:col-span-1'>
                    <CustomLabel title='Industry' isCompulsory />
                    <div className="relative w-full mt-1">
                        {/* <select
                            value={values.industry}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="industry"
                            className="block w-full rounded-md border focus:outline-none border-gray-300 py-2 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6 font-inter"
                        >
                            <option value="">Select Industry</option>
                            {industries.map((industry: string, index: number) => (
                                <option key={index} value={industry}>
                                    {industry}
                                </option>
                            ))}
                        </select> */}
                        <Field as="select" name="industry" className="block w-full rounded-md border focus:outline-none border-gray-300 py-2 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6 font-inter">
                            <option value="">Select Industry</option>
                            {industries.map((industry: string, index: number) => (
                                <option key={index} value={industry}>
                                    {industry}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage name="industry" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className='sm:col-span-1'>
                    <CustomLabel title='CIN No' isCompulsory />
                    <div className='relative w-full mt-1'>
                        <input type="text" name="cinNo" autoComplete="given-name" value={values.cinNo} onChange={handleChange} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="cinNo" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>

                <div className='sm:col-span-1'>
                    <CustomLabel title='Email' isCompulsory />
                    <div className='relative w-full mt-1'>
                        <input type="text" name="email" autoComplete="given-name" value={values.email} onChange={handleChange} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                        <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className='sm:col-span-1'>
                    <CustomLabel title='Mobile No' isCompulsory />
                    <div className='relative w-full mt-1'>
                        <input
                            type="tel"
                            name="mobileNo"
                            autoComplete="off"
                            inputMode="numeric"
                            maxLength={10}
                            value={values.mobileNo}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleChange({
                                    target: {
                                        name: "mobileNo",
                                        value: onlyNumbers,
                                    },
                                });
                            }}
                            className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        />                        <ErrorMessage name="mobileNo" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>
                <div className='sm:col-span-1'>
                    <CustomLabel title='Alternative Mobile No' />
                    <div className='relative w-full mt-1'>
                        <input type="text" name="alternativeMobileNo" autoComplete="given-name" value={values.alternativeMobileNo} onChange={handleChange} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div className='sm:col-span-1'>
                    <CustomLabel title='Password' isCompulsory />
                    <div className='relative w-full mt-1'>
                        <PasswordInput
                            value={values.password}
                            onChange={handleChange}
                            name='password'
                        />
                        <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
                    </div>
                </div>

                {/* <div className='sm:col-span-3'>
                    <CustomLabel title='Service Description'/>
                    <input type="text" required  autoComplete="given-name" value={regDetails.companyName} onChange={(e) => setRegDetails({ ...regDetails, companyName: e.target.value })} className="block w-full font-inter rounded-md border focus:outline-none border-gray-300 py-1 px-2 text-gray-900 focus:border-blue-500 focus:border-[2px] placeholder:text-gray-400 sm:text-sm sm:leading-6" />

                </div> */}
            </div>
        </div>
    )
}

export default PersonalDetails
