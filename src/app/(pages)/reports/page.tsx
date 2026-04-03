// "use client";
// import Layout from "@/app/component/MainLayout";
// import React, { JSX, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import DataTable, { TableColumn } from "react-data-table-component";
// import { IoSearchSharp } from "react-icons/io5";
// import Loader from "@/app/component/Loader/Loader";
// import { ROUTES } from "@/app/constants/routes";
// import Image from "next/image";
// import { noDataFound } from "@/app/utils/path";
// import CustomButton from "@/app/component/buttons/CustomButton";
// import Colors from "@/app/utils/colors";
// import {
//   getAllInvoice,
//   InvoiceData,
// } from "../sales/invoice/generate-invoice/generate-invoice";
// import { GetAllParams } from "../items/items";
// import * as XLSX from "xlsx";
// import FileSaver from "file-saver";
// import {
//   getAllSummeryReport,
//   getInvoiceReport,
//   SummeryReportData,
// } from "./reports";
// import { set } from "date-fns";
// import { encodeId } from "@/app/utils/hash-service";

// export interface DataRow {
//   no: number;
//   date: string;
//   particulars: string;
//   invoiceType: any;
//   invoiceNumber: string;
//   quantity: number;
//   material: string;
//   value: string;
//   royaltyValue: string;
//   dmf: string;
//   nmet: string;
//   totalTaxableValue: string;
//   sgst: string;
//   cgst: string;
//   igst: string;
//   total: string;
//   roundOff: string;
//   grandTotal: string;
//   paymentReceived: string;
//   closingBalance: string;
//   narration: string;
// }

// const Reports = () => {
//   const [dataRows, setDataRows] = useState<DataRow[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const [searchData, setSearchTableData] = useState("");
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     getAll();
//   }, []);

//   const param: Partial<GetAllParams> = {
//     sortDirection: "asc",
//   };

//   const formatAmount = (value?: number) =>
//     value !== undefined && value !== null
//       ? `${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
//       : "—";

//   const rightAlign = { textAlign: "right", display: "block" };

//   const headerColumn: TableColumn<DataRow>[] = [
//     {
//       name: "Date",
//       selector: (row) => row.date,
//       sortable: true,
//       width: "110px",
//       cell: (row, index) => {
//         const isLastRow = index === filteredData.length - 1;

//         return (
//           <span
//             className={`block text-right whitespace-nowrap ${
//               isLastRow ? "font-bold text-black" : ""
//             }`}
//           >
//             {isLastRow ? "Total" : row.date}
//           </span>
//         );
//       },
//     },
//     {
//       name: "Particulars",
//       selector: (row) => row.particulars,
//       sortable: true,
//       grow: 2,
//       width: "180px",
//       wrap: true,
//     },
//     {
//       name: "Invoice Type",
//       selector: (row) => row.invoiceType,
//       sortable: true,
//       width: "120px",
//       cell: (row, index) => {
//         const isLastRow = index === filteredData.length - 1;

//         return (
//           <span
//             className={`block text-right whitespace-nowrap ${
//               isLastRow ? "font-bold text-black" : ""
//             }`}
//           >
//             {isLastRow ? "" : "Sales"}
//           </span>
//         );
//       },
//     },
//     {
//       name: "Invoice No.",
//       selector: (row) => row.invoiceNumber,
//       width: "150px",
//       sortable: true,
//       cell: (row) => (
//         <span
//           onClick={() => {
//             const encodedId = encodeId(row.no);
//             router.push(`/sales/invoice/new-invoice/${encodedId}`);
//             // router.push(`${ROUTES.view_invoice}/${encodedId}`);
//           }}
//           className="cursor-pointer text-blue-600"
//         >
//           {row.invoiceNumber}
//         </span>
//       ),
//     },
//     {
//       name: "Material",
//       selector: (row) => row.material,
//       sortable: true,
//       grow: 2,
//       width: "200px",
//     },
//     {
//       name: "Qty",
//       selector: (row) => row.quantity,
//       sortable: true,
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">
//           {row.quantity ? row.quantity.toLocaleString("en-IN") : ""}
//         </span>
//       ),
//     },
//     {
//       name: "Value",
//       selector: (row) => row.value,
//       sortable: true,
//       // right: true,
//       width: "200px",
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">{row.value}</span>
//       ),
//     },
//     {
//       name: "Royalty",
//       width: "150px",
//       selector: (row) => row.royaltyValue,
//       sortable: true,
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">
//           {row.royaltyValue}
//         </span>
//       ),
//     },
//     {
//       name: "DMF",
//       width: "150px",
//       selector: (row) => row.dmf,
//       sortable: true,
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">{row.dmf}</span>
//       ),
//     },
//     {
//       name: "NMET",
//       selector: (row) => row.nmet,
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">{row.nmet}</span>
//       ),
//     },
//     {
//       name: "Taxable Value",
//       selector: (row) => row.totalTaxableValue,
//       sortable: true,
//       width: "150px",
//       cell: (row, index) => {
//         const isLastRow = index === filteredData.length - 1;

//         return (
//           <span
//             className={`block text-right whitespace-nowrap ${
//               isLastRow ? "font-bold text-black" : ""
//             }`}
//           >
//             {row.totalTaxableValue}
//           </span>
//         );
//       },
//     },
//     {
//       name: "SGST",
//       selector: (row) => row.sgst,
//       sortable: true,
//       cell: (row) => <span>{row.sgst}</span>,
//     },
//     {
//       name: "CGST",
//       selector: (row) => row.cgst,
//       sortable: true,
//       cell: (row) => <span>{row.cgst}</span>,
//     },
//     {
//       name: "IGST",
//       selector: (row) => row.igst,
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className="block text-right whitespace-nowrap">{row.igst}</span>
//       ),
//     },
//     {
//       name: "Total",
//       selector: (row) => row.total,
//       sortable: true,
//       width: "150px",
//       cell: (row, index) => {
//         const isLastRow = index === filteredData.length - 1;

//         return (
//           <span
//             className={`block text-right whitespace-nowrap ${
//               isLastRow ? "font-bold text-black" : ""
//             }`}
//           >
//             {row.total}
//           </span>
//         );
//       },
//     },
//     {
//       name: "Round Off",
//       selector: (row) => row.roundOff,
//       sortable: true,
//       width: "120px",
//       cell: (row) => <span>{row.roundOff}</span>,
//     },
//     {
//       name: "Grand Total",
//       selector: (row) => row.grandTotal,
//       sortable: true,
//       width: "160px",
//       cell: (row, index) => {
//         const isLastRow = index === filteredData.length - 1;

//         return (
//           <span
//             className={`block text-right whitespace-nowrap ${
//               isLastRow ? "font-bold text-black" : ""
//             }`}
//           >
//             {row.grandTotal}
//           </span>
//         );
//       },
//     },
//     // {
//     //   name: 'Payment Received',
//     //   selector: row => row.paymentReceived,
//     //   sortable: true,
//     //   width: '170px',
//     //   cell: row => (
//     //     <span className="text-blue-700">
//     //       {row.paymentReceived}
//     //     </span>
//     //   ),
//     // },
//     // {
//     //   name: 'Closing Balance',
//     //   selector: row => row.closingBalance,
//     //   sortable: true,
//     //   width: '200px',
//     //   // cell: row => (
//     //   //   <span className={`font-medium ${parseInt(row.closingBalance) > 0 ? 'text-red-600' : 'text-green-600'} block text-right whitespace-nowrap`}>
//     //   //     {row.closingBalance}
//     //   //   </span>
//     //   // ),
//     //   cell: (row, index) => {
//     //     const isLastRow = index === filteredData.length - 1;

//     //     return (
//     //       <span
//     //         className={`block text-right whitespace-nowrap ${isLastRow ? 'font-bold text-black' : ''
//     //           }`}
//     //       >
//     //         {row.closingBalance}
//     //       </span>
//     //     );
//     //   },
//     // },
//     {
//       name: "Narration",
//       selector: (row) => row.narration,
//       sortable: true,
//       grow: 2,
//       cell: (row) => (
//         <span className="italic text-gray-500">{row.narration || "—"}</span>
//       ),
//     },
//   ];
//   const getAll = async () => {
//     try {
//       setIsLoading(true);
//       const localCompanyId = localStorage.getItem("selectedCompanyId") ?? "";
//       const res = await getAllSummeryReport();
//       if (res.success) {
//         const formattedData: DataRow[] = res.data.map(
//           (report: SummeryReportData, index: number) => ({
//             no: index + 1,
//             date: report.date,
//             particulars: report.particulars,
//             invoiceType: report.invoiceType,
//             invoiceNumber: report.invoiceNumber,
//             quantity: report.quantity,
//             material: report.material,
//             value: report.value,
//             royaltyValue: report.royaltyValue,
//             dmf: report.dmf,
//             nmet: report.nmet,
//             totalTaxableValue: report.totalTaxableValue,
//             sgst: report.sgst,
//             cgst: report.cgst,
//             igst: report.igst,
//             total: report.total,
//             roundOff: report.roundOff,
//             grandTotal: report.grandTotal,
//             paymentReceived: report.paymentReceived,
//             closingBalance: report.closingBalance,
//             narration: report.narration,
//           }),
//         );
//         setDataRows(formattedData);
//       } else {
//         setDataRows([]);
//       }
//     } catch (err: any) {
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const customStyles = {
//     headCells: {
//       style: {
//         backgroundColor: "rgba(117, 117, 117, 0.4)",
//         color: "black",
//         fontSize: "12px",
//         justifyContent: "flex-end",
//         textAlign: "right" as const,
//         whiteSpace: "nowrap", // ✅ ADD THIS
//       },
//     },
//     cells: {
//       style: {
//         justifyContent: "flex-end",
//         textAlign: "right" as const,
//         whiteSpace: "nowrap", // ✅ ADD THIS
//       },
//     },
//   };

//   const filteredData = dataRows.filter((row) =>
//     Object.values(row)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchData.toLowerCase()),
//   );

//   const fileType =
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
//   const fileExtension = ".xlsx";

//   const exportToCSV = () => {
//     const ws = XLSX.utils.json_to_sheet(filteredData);
//     const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: fileType });
//     FileSaver.saveAs(data, "Download-XLSX" + fileExtension);
//   };

//   const handleDownload = async () => {
//     try {
//       setLoading(true);
//       const result = await getInvoiceReport();

//       if (result.success && result.data) {
//         const byteCharacters = atob(result.data);
//         const byteNumbers = new Array(byteCharacters.length);
//         for (let i = 0; i < byteCharacters.length; i++) {
//           byteNumbers[i] = byteCharacters.charCodeAt(i);
//         }
//         const byteArray = new Uint8Array(byteNumbers);
//         const blob = new Blob([byteArray], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });

//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "Invoice-Report.xlsx";
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//       } else {
//         alert("Error: " + result.error);
//       }
//     } catch (error) {
//       console.error("Download Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const parseAmount = (val?: string) => {
//     if (!val) return 0;
//     return Number(val.replace(/,/g, "").replace("₹", "")) || 0;
//   };
//   const totals = filteredData.reduce(
//     (acc, row) => {
//       acc.quantity += row.quantity || 0;
//       acc.value += parseAmount(row.value);
//       acc.royalty += parseAmount(row.royaltyValue);
//       acc.dmf += parseAmount(row.dmf);
//       acc.nmet += parseAmount(row.nmet);
//       acc.taxable += parseAmount(row.totalTaxableValue);
//       acc.sgst += parseAmount(row.sgst);
//       acc.cgst += parseAmount(row.cgst);
//       acc.igst += parseAmount(row.igst);
//       acc.grandTotal += parseAmount(row.grandTotal);
//       acc.payment += parseAmount(row.paymentReceived);
//       acc.closing += parseAmount(row.closingBalance);
//       return acc;
//     },
//     {
//       quantity: 0,
//       value: 0,
//       royalty: 0,
//       dmf: 0,
//       nmet: 0,
//       taxable: 0,
//       sgst: 0,
//       cgst: 0,
//       igst: 0,
//       grandTotal: 0,
//       payment: 0,
//       closing: 0,
//     },
//   );

//   return (
//     <div className="relative w-full h-full p-5">
//       <div className="relative flex flex-col w-full h-full">
//         <h1 className="text-3xl font-bold text-center text-black mb-10">
//           Summery Report
//         </h1>
//         <div className="flex items-center justify-between space-x-3">
//           <div className="py-3 relative">
//             <input
//               type="text"
//               placeholder="Search Here ...!"
//               className="px-2 py-1 border rounded-lg text-sm placeholder:text-sm bg-white text-black"
//               style={{ borderRadius: "0.3rem" }}
//               onChange={(e) => setSearchTableData(e.target.value)}
//             />
//             <IoSearchSharp className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
//           </div>
//           <div className="flex space-x-3 mx-3">
//             <CustomButton
//               name={loading ? "Exporting..." : "Export"}
//               disabled={loading}
//               className="text-white px-4 py-2 rounded-lg text-sm  border-none transition font-inter"
//               style={{
//                 background: `linear-gradient(to right, ${Colors.gradient1}, ${Colors.gradient2})`,
//               }}
//               onClick={handleDownload}
//             />
//           </div>
//         </div>
//         <div>
//           {isLoading ? (
//             <div className="flex-grow">
//               <div className="inset-0 flex justify-center items-center">
//                 <Loader isInside={true} />
//               </div>
//             </div>
//           ) : (
//             <DataTable
//               columns={headerColumn}
//               data={filteredData}
//               fixedHeader
//               customStyles={customStyles}
//               pagination
//               highlightOnHover
//               noDataComponent={
//                 <div className="flex flex-col items-center justify-center py-6 w-full rounded-full">
//                   <Image
//                     src={noDataFound}
//                     alt="No Data Found"
//                     width={300}
//                     height={300}
//                     className="mb-4"
//                   />
//                 </div>
//               }
//               className="font-inter rounded"
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import DataTable, { TableColumn, SortFunction } from "react-data-table-component";
// import { IoSearchSharp } from "react-icons/io5";
// import Loader from "@/app/component/Loader/Loader";
// import Image from "next/image";
// import { noDataFound } from "@/app/utils/path";
// import CustomButton from "@/app/component/buttons/CustomButton";
// import Colors from "@/app/utils/colors";
// import {
//   getAllSummeryReport,
//   getInvoiceReport,
//   SummeryReportData,
// } from "./reports";
// import { encodeId } from "@/app/utils/hash-service";

// export interface DataRow {
//   no: number;
//   date: string;
//   particulars: string;
//   invoiceId: number;
//   invoiceType: string;
//   invoiceNumber: string;
//   quantity: number;
//   material: string;
//   value: string;
//   royaltyValue: string;
//   dmf: string;
//   nmet: string;
//   totalTaxableValue: string;
//   sgst: string;
//   cgst: string;
//   igst: string;
//   total: string;
//   roundOff: string;
//   grandTotal: string;
//   paymentReceived: string;
//   closingBalance: string;
//   narration: string;
//   isTotal?: boolean;
// }

// const Reports = () => {
//   const [dataRows, setDataRows] = useState<DataRow[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchData, setSearchTableData] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     getAll();
//   }, []);

//   const parseAmount = (val?: string): number => {
//     if (!val) return 0;
//     return Number(String(val).replace(/,/g, "").replace("₹", "").trim()) || 0;
//   };

//   const formatAmount = (value?: number): string =>
//     value !== undefined && value !== null
//       ? value.toLocaleString("en-IN", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })
//       : "0.00";

//   const getAll = async () => {
//     try {
//       setIsLoading(true);

//       const res = await getAllSummeryReport();

//       if (res.success) {
//         const formattedData: DataRow[] = res.data
//           .filter((report: any) => report.date !== "Total") // 👈 ADD THIS LINE
//           .map((report: SummeryReportData, index: number) => ({
//             no: index + 1,
//             invoiceId: report.invoiceId || 0,
//             date: report.date || "",
//             particulars: report.particulars || "",
//             invoiceType: report.invoiceType || "",
//             invoiceNumber: report.invoiceNumber || "",
//             quantity: report.quantity || 0,
//             material: report.material || "",
//             value: report.value || "0.00",
//             royaltyValue: report.royaltyValue || "0.00",
//             dmf: report.dmf || "0.00",
//             nmet: report.nmet || "0.00",
//             totalTaxableValue: report.totalTaxableValue || "0.00",
//             sgst: report.sgst || "0.00",
//             cgst: report.cgst || "0.00",
//             igst: report.igst || "0.00",
//             total: report.total || "0.00",
//             roundOff: report.roundOff || "0.00",
//             grandTotal: report.grandTotal || "0.00",
//             paymentReceived: report.paymentReceived || "0.00",
//             closingBalance: report.closingBalance || "0.00",
//             narration: report.narration || "",
//             isTotal: false,
//           })
//           );

//         setDataRows(formattedData);
//       } else {
//         setDataRows([]);
//       }
//     } catch (error) {
//       console.error("Get summary report error:", error);
//       setDataRows([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredData = useMemo(() => {
//     return dataRows.filter((row) =>
//       Object.values(row)
//         .join(" ")
//         .toLowerCase()
//         .includes(searchData.toLowerCase())
//     );
//   }, [dataRows, searchData]);

//   const totals = useMemo(() => {
//     return filteredData.reduce(
//       (acc, row) => {
//         if (row.isTotal) return acc;

//         acc.quantity += row.quantity || 0;
//         acc.value += parseAmount(row.value);
//         acc.royalty += parseAmount(row.royaltyValue);
//         acc.dmf += parseAmount(row.dmf);
//         acc.nmet += parseAmount(row.nmet);
//         acc.taxable += parseAmount(row.totalTaxableValue);
//         acc.sgst += parseAmount(row.sgst);
//         acc.cgst += parseAmount(row.cgst);
//         acc.igst += parseAmount(row.igst);
//         acc.total += parseAmount(row.total);
//         acc.roundOff += parseAmount(row.roundOff);
//         acc.grandTotal += parseAmount(row.grandTotal);
//         acc.payment += parseAmount(row.paymentReceived);
//         acc.closing += parseAmount(row.closingBalance);
//         return acc;
//       },
//       {
//         quantity: 0,
//         value: 0,
//         royalty: 0,
//         dmf: 0,
//         nmet: 0,
//         taxable: 0,
//         sgst: 0,
//         cgst: 0,
//         igst: 0,
//         total: 0,
//         roundOff: 0,
//         grandTotal: 0,
//         payment: 0,
//         closing: 0,
//       }
//     );
//   }, [filteredData]);

//   const totalRow: DataRow = useMemo(
//     () => ({
//       no: -1,
//       date: "Total",
//       particulars: "",
//       invoiceId: 0,
//       invoiceType: "",
//       invoiceNumber: "",
//       quantity: totals.quantity,
//       material: "",
//       value: formatAmount(totals.value),
//       royaltyValue: formatAmount(totals.royalty),
//       dmf: formatAmount(totals.dmf),
//       nmet: formatAmount(totals.nmet),
//       totalTaxableValue: formatAmount(totals.taxable),
//       sgst: formatAmount(totals.sgst),
//       cgst: formatAmount(totals.cgst),
//       igst: formatAmount(totals.igst),
//       total: formatAmount(totals.total),
//       roundOff: formatAmount(totals.roundOff),
//       grandTotal: formatAmount(totals.grandTotal),
//       paymentReceived: formatAmount(totals.payment),
//       closingBalance: formatAmount(totals.closing),
//       narration: "",
//       isTotal: true,
//     }),
//     [totals]
//   );

//   const tableData = useMemo(() => {
//     return [...filteredData, totalRow];
//   }, [filteredData, totalRow]);

//   const customSort: SortFunction<DataRow> = (rows, field, direction) => {
//     const normalRows = rows.filter((row) => !row.isTotal);
//     const total = rows.find((row) => row.isTotal);

//     const getSortableValue = (row: DataRow): string | number => {
//       const value = field(row);

//       if (typeof value === "number") return value;
//       if (typeof value === "string") return value.toLowerCase();

//       return "";
//     };

//     const sortedRows = [...normalRows].sort((a, b) => {
//       const aValue = getSortableValue(a);
//       const bValue = getSortableValue(b);

//       if (aValue < bValue) return direction === "asc" ? -1 : 1;
//       if (aValue > bValue) return direction === "asc" ? 1 : -1;
//       return 0;
//     });

//     return total ? [...sortedRows, total] : sortedRows;
//   };

//   const totalCellClass = (row: DataRow) =>
//     row.isTotal ? "font-bold text-black" : "";

//   const headerColumn: TableColumn<DataRow>[] = [
//     {
//       name: "Date",
//       selector: (row) => row.date,
//       sortable: true,
//       width: "110px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.isTotal ? "Total" : row.date}
//         </span>
//       ),
//     },
//     {
//       name: "Particulars",
//       selector: (row) => row.particulars,
//       sortable: true,
//       grow: 2,
//       width: "180px",
//       wrap: true,
//       cell: (row) => (
//         <span className={totalCellClass(row)}>
//           {row.isTotal ? "" : row.particulars}
//         </span>
//       ),
//     },
//     {
//       name: "Invoice ID",
//       selector: (row) => row.invoiceId,
//       sortable: true,
//       width: "110px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.isTotal ? "" : row.invoiceId}
//         </span>
//       ),
//     },
//     {
//       name: "Invoice Type",
//       selector: (row) => row.invoiceType,
//       sortable: true,
//       width: "120px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.isTotal ? "" : row.invoiceType || "Sales"}
//         </span>
//       ),
//     },
//     {
//       name: "Invoice No.",
//       selector: (row) => row.invoiceNumber,
//       sortable: true,
//       width: "150px",
//       cell: (row) =>
//         row.isTotal ? (
//           <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}></span>
//         ) : (
//           <span
//             onClick={() => {
//               const encodedId = encodeId(row.invoiceId);
//               router.push(`/sales/invoice/new-invoice/${encodedId}`);
//             }}
//             className="cursor-pointer text-blue-600"
//           >
//             {row.invoiceNumber}
//           </span>
//         ),
//     },
//     {
//       name: "Material",
//       selector: (row) => row.material,
//       sortable: true,
//       grow: 2,
//       width: "200px",
//       cell: (row) => <span className={totalCellClass(row)}>{row.material}</span>,
//     },
//     {
//       name: "Qty",
//       selector: (row) => row.quantity,
//       sortable: true,
//       width: "100px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.isTotal
//             ? row.quantity.toLocaleString("en-IN")
//             : row.quantity
//               ? row.quantity.toLocaleString("en-IN")
//               : ""}
//         </span>
//       ),
//     },
//     {
//       name: "Value",
//       selector: (row) => parseAmount(row.value),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.value}
//         </span>
//       ),
//     },
//     {
//       name: "Royalty",
//       selector: (row) => parseAmount(row.royaltyValue),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.royaltyValue}
//         </span>
//       ),
//     },
//     {
//       name: "DMF",
//       selector: (row) => parseAmount(row.dmf),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.dmf}
//         </span>
//       ),
//     },
//     {
//       name: "NMET",
//       selector: (row) => parseAmount(row.nmet),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.nmet}
//         </span>
//       ),
//     },
//     {
//       name: "Taxable Value",
//       selector: (row) => parseAmount(row.totalTaxableValue),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.totalTaxableValue}
//         </span>
//       ),
//     },
//     {
//       name: "SGST",
//       selector: (row) => parseAmount(row.sgst),
//       sortable: true,
//       width: "120px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.sgst}
//         </span>
//       ),
//     },
//     {
//       name: "CGST",
//       selector: (row) => parseAmount(row.cgst),
//       sortable: true,
//       width: "120px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.cgst}
//         </span>
//       ),
//     },
//     {
//       name: "IGST",
//       selector: (row) => parseAmount(row.igst),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.igst}
//         </span>
//       ),
//     },
//     {
//       name: "Total",
//       selector: (row) => parseAmount(row.total),
//       sortable: true,
//       width: "150px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.total}
//         </span>
//       ),
//     },
//     {
//       name: "Round Off",
//       selector: (row) => parseAmount(row.roundOff),
//       sortable: true,
//       width: "120px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.roundOff}
//         </span>
//       ),
//     },
//     {
//       name: "Grand Total",
//       selector: (row) => parseAmount(row.grandTotal),
//       sortable: true,
//       width: "160px",
//       cell: (row) => (
//         <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
//           {row.grandTotal}
//         </span>
//       ),
//     },
//     {
//       name: "Narration",
//       selector: (row) => row.narration,
//       sortable: true,
//       grow: 2,
//       cell: (row) => (
//         <span className={row.isTotal ? "font-bold text-black" : "italic text-gray-500"}>
//           {row.isTotal ? "" : row.narration || "—"}
//         </span>
//       ),
//     },
//   ];

//   const customStyles = {
//     headCells: {
//       style: {
//         backgroundColor: "rgba(117, 117, 117, 0.4)",
//         color: "black",
//         fontSize: "12px",
//         justifyContent: "flex-end",
//         textAlign: "right" as const,
//         whiteSpace: "nowrap" as const,
//         fontWeight: 600,
//       },
//     },
//     cells: {
//       style: {
//         justifyContent: "flex-end",
//         textAlign: "right" as const,
//         whiteSpace: "nowrap" as const,
//       },
//     },
//   };

//   const handleDownload = async () => {
//     try {
//       setLoading(true);
//       const result = await getInvoiceReport();

//       if (result.success && result.data) {
//         const byteCharacters = atob(result.data);
//         const byteNumbers = new Array(byteCharacters.length);

//         for (let i = 0; i < byteCharacters.length; i++) {
//           byteNumbers[i] = byteCharacters.charCodeAt(i);
//         }

//         const byteArray = new Uint8Array(byteNumbers);
//         const blob = new Blob([byteArray], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });

//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "Invoice-Report.xlsx";
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//       } else {
//         alert("Error: " + result.error);
//       }
//     } catch (error) {
//       console.error("Download Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative w-full h-full p-5">
//       <div className="relative flex flex-col w-full h-full">
//         <h1 className="text-3xl font-bold text-center text-black mb-10">
//           Summary Report
//         </h1>

//         <div className="flex items-center justify-between space-x-3">
//           <div className="py-3 relative">
//             <input
//               type="text"
//               placeholder="Search Here ...!"
//               className="px-2 py-1 border rounded-lg text-sm placeholder:text-sm bg-white text-black"
//               style={{ borderRadius: "0.3rem" }}
//               onChange={(e) => setSearchTableData(e.target.value)}
//             />
//             <IoSearchSharp className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
//           </div>

//           <div className="flex space-x-3 mx-3">
//             <CustomButton
//               name={loading ? "Exporting..." : "Export"}
//               disabled={loading}
//               className="text-white px-4 py-2 rounded-lg text-sm border-none transition font-inter"
//               style={{
//                 background: `linear-gradient(to right, ${Colors.gradient1}, ${Colors.gradient2})`,
//               }}
//               onClick={handleDownload}
//             />
//           </div>
//         </div>

//         <div>
//           {isLoading ? (
//             <div className="flex-grow">
//               <div className="inset-0 flex justify-center items-center">
//                 <Loader isInside={true} />
//               </div>
//             </div>
//           ) : (
//             <DataTable
//               columns={headerColumn}
//               data={tableData}
//               sortFunction={customSort}
//               fixedHeader
//               customStyles={customStyles}
//               pagination
//               highlightOnHover
//               noDataComponent={
//                 <div className="flex flex-col items-center justify-center py-6 w-full rounded-full">
//                   <Image
//                     src={noDataFound}
//                     alt="No Data Found"
//                     width={300}
//                     height={300}
//                     className="mb-4"
//                   />
//                 </div>
//               }
//               className="font-inter rounded"
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, SortFunction } from "react-data-table-component";
import { IoSearchSharp } from "react-icons/io5";
import Loader from "@/app/component/Loader/Loader";
import Image from "next/image";
import { noDataFound } from "@/app/utils/path";
import CustomButton from "@/app/component/buttons/CustomButton";
import Colors from "@/app/utils/colors";
import {
  getAllSummeryReport,
  getInvoiceReport,
  SummeryReportData,
} from "./reports";
import { encodeId } from "@/app/utils/hash-service";

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
  narration: string;
  isTotal?: boolean;
}

const Reports = () => {
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchData, setSearchTableData] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAll();
  }, []);

  const parseAmount = (val?: string): number => {
    if (!val) return 0;
    return Number(String(val).replace(/,/g, "").replace("₹", "").trim()) || 0;
  };

  const formatAmount = (value?: number): string =>
    value !== undefined && value !== null
      ? value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "0.00";

  const getAll = async () => {
    try {
      setIsLoading(true);
      const localCompanyId = localStorage.getItem('selectedCompanyId') ?? '';
      const res = await getAllSummeryReport(localCompanyId);

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
          })
          );

        setDataRows(formattedData);
      } else {
        setDataRows([]);
      }
    } catch (error) {
      console.error("Get summary report error:", error);
      setDataRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return dataRows.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchData.toLowerCase())
    );
  }, [dataRows, searchData]);

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

  const customSort: SortFunction<DataRow> = (rows, field, direction) => {
    const normalRows = rows.filter((row) => !row.isTotal);
    const total = rows.find((row) => row.isTotal);

    const getSortableValue = (row: DataRow): string | number => {
      const value = field(row);

      if (typeof value === "number") return value;
      if (typeof value === "string") return value.toLowerCase();

      return "";
    };

    const sortedRows = [...normalRows].sort((a, b) => {
      const aValue = getSortableValue(a);
      const bValue = getSortableValue(b);

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return total ? [...sortedRows, total] : sortedRows;
  };

  const totalCellClass = (row: DataRow) =>
    row.isTotal ? "font-bold text-black" : "";

  const headerColumn: TableColumn<DataRow>[] = [
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      width: "110px",
      cell: (row) => (
        <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
          {row.isTotal ? "Total" : row.date}
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
      name: "SGST",
      selector: (row) => parseAmount(row.sgst),
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
          {row.sgst}
        </span>
      ),
    },
    {
      name: "CGST",
      selector: (row) => parseAmount(row.cgst),
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
          {row.cgst}
        </span>
      ),
    },
    {
      name: "IGST",
      selector: (row) => parseAmount(row.igst),
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span className={`block text-right whitespace-nowrap ${totalCellClass(row)}`}>
          {row.igst}
        </span>
      ),
    },
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
      name: "Narration",
      selector: (row) => row.narration,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <span className={row.isTotal ? "font-bold text-black" : "italic text-gray-500"}>
          {row.isTotal ? "" : row.narration || "—"}
        </span>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "rgba(117, 117, 117, 0.4)",
        color: "black",
        fontSize: "12px",
        justifyContent: "flex-end",
        textAlign: "right" as const,
        whiteSpace: "nowrap" as const,
        fontWeight: 600,
      },
    },
    cells: {
      style: {
        justifyContent: "flex-end",
        textAlign: "right" as const,
        whiteSpace: "nowrap" as const,
      },
    },
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const result = await getInvoiceReport();

      if (result.success && result.data) {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Invoice-Report.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Download Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tableData = useMemo(() => {
    return [...filteredData, totalRow];
  }, [filteredData, totalRow]);

  const hasValidData = useMemo(() => {
    return filteredData.some(row => parseAmount(row.grandTotal) > 0);
  }, [filteredData]);

  return (
    <div className="relative w-full h-full p-5">
      <div className="relative flex flex-col w-full h-full">
        <h1 className="text-3xl font-bold text-center text-black mb-10">
          Summary Report
        </h1>

        <div className="flex items-center justify-between space-x-3">
          <div className="py-3 relative">
            <input
              type="text"
              placeholder="Search Here ...!"
              className="px-2 py-1 border rounded-lg text-sm placeholder:text-sm bg-white text-black"
              style={{ borderRadius: "0.3rem" }}
              onChange={(e) => setSearchTableData(e.target.value)}
            />
            <IoSearchSharp className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>

          <div className="flex space-x-3 mx-3">
            <CustomButton
              name={loading ? "Exporting..." : "Export"}
              disabled={loading}
              className="text-white px-4 py-2 rounded-lg text-sm border-none transition font-inter"
              style={{
                background: `linear-gradient(to right, ${Colors.gradient1}, ${Colors.gradient2})`,
              }}
              onClick={handleDownload}
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
              data={hasValidData ? tableData : []}
              sortFunction={customSort}
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
              className="font-inter rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

