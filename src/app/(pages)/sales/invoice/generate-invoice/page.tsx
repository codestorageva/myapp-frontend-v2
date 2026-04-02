"use client";
import TextField from "@/app/component/inputfield";
import CustomLabel from "@/app/component/label";
import Layout from "@/app/component/MainLayout";
import {
  InvoiceData,
  InvoiceDetails,
  InvoiceProduct,
  MiningCharges,
  OtherCharges,
} from "@/app/types/invoice";
import { faGear, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { use, useEffect, useState } from "react";
import PreviewInvoice from "../view-invoice/[id]/page";
import { InvoiceIDModel } from "@/app/component/invoice_prefix_model.tsx";
import { CustomerData, fetchAllCustomer } from "../../customer/customer";
import {
  GetAllItemData,
  getAllItems,
  GetAllParams,
} from "../../../items/items";
import StateDropDown from "../../../common/state_dropdown/StateDropDown";
import * as Yup from "yup";
import { ErrorMessage, Form, Formik } from "formik";
import PreviewInvoicePDF from "../view-invoice/page2";
import {
  generate,
  GenerateInvoiceRequest,
  getAllInvoice,
} from "./generate-invoice";
import type { InvoiceItems } from "./generate-invoice";
import { toast } from "react-toastify";
import Loader from "@/app/component/Loader/Loader";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/app/constants/routes";
import Colors from "@/app/utils/colors";
import AddNewItem from "../../../items/new-item/AddNewItemForm";
import { getCompanyById } from "@/app/(pages)/dashboard-page/dashboard";
import Customer from "../../customer/add/page";
import { encodeId } from "@/app/utils/hash-service";

const GenerateInvoice = () => {
  const [state, setStateName] = useState("");
  const [city, setCityName] = useState("");
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
  ];
  const cities = [
    "Ahmedabad",
    "Surat",
    "Baroda",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Porbandar",
    "Morbi",
    "Nadiad",
    "Bharuch",
    "Vapi",
    "Ankleshwar",
    "Patan",
    "Mehsana",
    "Bhuj",
    "Palanpur",
    "Veraval",
    "Surendranagar",
  ];
  const paymentMode = ["Cash", "Banking"];
  const terms = [
    "Net 45",
    "Net 60",
    "Due On Receipt",
    "Due end of the month",
    "Due end of the next month",
    "Custom",
  ];
  const [term, setTerm] = useState("Due On Receipt");
  const [showInvoice, setShowInvoice] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date().toISOString().split("T")[0];
  const [invoiceData, setInvoiceData] = useState<InvoiceDetails>({
    narration: "",
    term: "Due On Receipt",
    customerId: "",
    customerName: "",
    dueDate: dueDate,
    lrNo: "",
    transport: "",
    range: "",
    division: "",
    commissionerate: "",
    invoicePrefix: "VV",
    invoiceNumber: "00001",
    companyName: "",
    date: today,
    time: "",
    address: "",
    city: "",
    gstNo: "",
    gstPer: "",
    items: [
      {
        productId: "",
        finalAmount: 0,
        amount: 0,
        qty: 0,
        rate: 0,
        gstPer: "0",
        taxPref: "",
      },
    ],
    netAmount: "",
    paymentMode: "",
    pincode: "",
    state: "",
    taxAmount: "",
    taxValue: "",
  });
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const param: Partial<GetAllParams> = {
    sortDirection: "asc",
  };
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [itemList, setItemListData] = useState<GetAllItemData[]>([]);
  const [rows, setRows] = useState<InvoiceProduct[]>([
    {
      productId: "",
      qty: 1,
      rate: 0,
      amount: 0,
      gstPer: "0",
      finalAmount: 0,
      taxPref: "",
    },
  ]);
  const [showDiesel, setShowDiesel] = useState(false);
  const [dieselAmount, setDieselAmount] = useState("");
  const [isInvoiceGenerate, setGenerateInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otherCharges, setOtherCharges] = useState<OtherCharges[]>([]);
  const [roundOff, setRoundOff] = useState<number>(0);
  const [isOutOfGujarat, setIsOutOfGujarat] = useState(false);
  const [isRCM, setIsRCM] = useState(false);
  const validateSchema = Yup.object().shape({
    invoicePrefix: Yup.string().required("Prefix is required"),
    invoiceNumber: Yup.string().required("Invoice number is required"),
    date: Yup.string().required("Date is required"),
    dueDate: Yup.string().required("Due date is required"),
    customerId: Yup.string().required("Customer is required"),
    paymentMode: Yup.string().required("Paymeny Mode is required"),
  });
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isManualRoundOff, setIsManualRoundOff] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [qtyInput, setQtyInput] = useState<{ [key: number]: string }>({});
  const [roundOffInput, setRoundOffInput] = useState<string>(
    roundOff.toFixed(2),
  );
  const [rateInput, setRateInput] = useState<{ [key: number]: string }>({});

  // const handleItemChange = (index: number, itemId: string) => {
  //     const selectedItem = itemList.find((item) => item.productId === parseInt(itemId));
  //     if (!selectedItem) return;
  //     const newRows = [...rows];
  //     newRows[index].productId = itemId;

  //     const rate = selectedItem.sellingPrice ?? 0;
  //     const qty = newRows[index].qty ?? 1;
  //     newRows[index].qty = qty;
  //     newRows[index].rate = rate;
  //     newRows[index].amount = rate * newRows[index].qty;
  //     console.log("GST PERCENTAGE : ",selectedItem.gstPercent)
  //     setRows(newRows);
  // };

  const handleItemChange = (index: number, itemId: string) => {
    const selectedItem = itemList.find(
      (item) => item.productId === parseInt(itemId),
    );
    if (!selectedItem) return;
    const newRows = [...rows];
    newRows[index].productId = itemId;
    const rate = selectedItem.sellingPrice ?? 0;
    const qty = newRows[index].qty ?? 1;
    const amount = rate * qty;
    const gstPercentStr = selectedItem.gstPercent?.replace("%", "") ?? "0";
    const gstPercent = parseFloat(gstPercentStr);
    const gstAmount = (amount * gstPercent) / 100;
    const finalAmount = amount + gstAmount;
    newRows[index].qty = qty;
    newRows[index].rate = rate;
    newRows[index].gstPer = `${gstPercent}%`;
    newRows[index].amount = amount;
    newRows[index].finalAmount = finalAmount;
    newRows[index].taxPref = selectedItem.taxPreference;
    console.log("GST PERCENTAGE : ", selectedItem.gstPercent);
    setRows(newRows);
  };

  // const handleQtyChange = (index: number, qty: number) => {
  //     const newRows = [...rows];
  //     newRows[index].qty = qty;
  //     newRows[index].amount = qty * newRows[index].rate;
  //     setRows(newRows);
  // };

  const handleQtyChange = (index: number, qty: number) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];

      updatedRows[index] = {
        ...updatedRows[index],
        qty: qty,
        amount: qty * (updatedRows[index].rate || 0),
      };

      return updatedRows;
    });
  };
  const handleAddRow = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setRows([
      ...rows,
      {
        productId: "",
        qty: 1,
        rate: 0,
        amount: 0,
        gstPer: "0",
        finalAmount: 0,
        taxPref: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleRemoveOtherRow = (index: number) => {
    const newRows = [...otherCharges];
    newRows.splice(index, 1);
    setOtherCharges(newRows);
  };

  const handleAddOtherRow = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setOtherCharges([...otherCharges, { label: "", value: 0 }]);
  };

  const handleOtherChange = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    const newRows = [...otherCharges];
    if (field === "value") {
      newRows[index][field] = parseFloat(value) || 0;
    } else {
      newRows[index][field] = value;
    }
    setOtherCharges(newRows);
  };

  // const gstGroupedTotals = rows.reduce((acc, row) => {
  //     let gst = parseFloat(row.gstPer?.replace('%', '') || '0');
  //     if (isNaN(gst)) gst = 0;

  //     if (!acc[gst]) {
  //         acc[gst] = {
  //             taxableAmount: 0,
  //             cgstPercent: gst / 2,
  //             sgstPercent: gst / 2,
  //             cgstAmount: 0,
  //             sgstAmount: 0,
  //         };
  //     }

  //     acc[gst].taxableAmount += row.amount || 0; // also prevent NaN from amount
  //     return acc;
  // }, {} as Record<number, {
  //     taxableAmount: number,
  //     cgstPercent: number,
  //     sgstPercent: number,
  //     cgstAmount: number,
  //     sgstAmount: number,
  // }>);

  // const getMiningRows = (row: InvoiceProduct) => {
  //     const item = itemList.find(
  //         i => i.productId === Number(row.productId)
  //     );
  //     if (!item || !item.miningProduct) return [];

  //     const qty = Number(row.qty);
  //     const rate = Number(row.rate);

  //     if (!qty || !rate) return [];

  //     const baseAmount = qty * rate;

  //     const royaltyValue = qty * Number(item.royalty)
  //     const dmfValue = (royaltyValue * 30) / 100;
  //     const nmetValue = (royaltyValue * 2) / 100;

  //     return [
  //         {
  //             label: `Royalty (${item.royalty}%)`,
  //             rate: `${item.royalty}`,
  //             value: royaltyValue
  //         },
  //         {
  //             label: `DMF 30% on Royalty)`,
  //             rate: `${item.dmf}`,
  //             value: dmfValue
  //         },
  //         {
  //             label: `NMET 2% on Royalty)`,
  //             rate: `${item.nmet}`,
  //             value: nmetValue
  //         }
  //     ];
  // };
  const getMiningRows = (row: InvoiceProduct) => {
    const item = itemList.find((i) => i.productId === Number(row.productId));

    if (!item || !item.miningProduct) return [];

    const qty = Number(row.qty);
    if (!qty) return [];

    const royaltyValue = qty * Number(item.royalty);
    const dmfValue = (royaltyValue * 30) / 100;
    const nmetValue = (royaltyValue * 2) / 100;

    return [
      {
        label: `Royalty`,
        rate: `${item.royalty}`,
        value: royaltyValue,
      },
      {
        label: `DMF (30% on Royalty)`,
        rate: `${item.dmf}`,
        value: dmfValue,
      },
      {
        label: `NMET (2% on Royalty)`,
        rate: `${item.nmet}`,
        value: nmetValue,
      },
    ];
  };

  const gstGroupedTotals = rows.reduce(
    (acc, row) => {
      let gst = parseFloat(row.gstPer?.replace("%", "") || "0");
      if (isNaN(gst)) gst = 0;

      if (!acc[gst]) {
        acc[gst] = {
          taxableAmount: 0,
          cgstPercent: isOutOfGujarat ? 0 : gst / 2,
          sgstPercent: isOutOfGujarat ? 0 : gst / 2,
          igstPercent: isOutOfGujarat ? gst : 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
        };
      }

      //change 14-0-26
      // const taxable = row.amount || 0;
      const miningExtras = getMiningRows(row).reduce((s, r) => s + r.value, 0);

      const taxable = (row.amount || 0) + miningExtras;
      acc[gst].taxableAmount += taxable;

      if (isOutOfGujarat) {
        acc[gst].igstAmount += (taxable * gst) / 100;
      } else {
        acc[gst].cgstAmount += (taxable * (gst / 2)) / 100;
        acc[gst].sgstAmount += (taxable * (gst / 2)) / 100;
      }

      return acc;
    },
    {} as Record<
      number,
      {
        taxableAmount: number;
        cgstPercent: number;
        sgstPercent: number;
        igstPercent: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
      }
    >,
  );

  // Calculate CGST and SGST per GST group
  for (const key in gstGroupedTotals) {
    const group = gstGroupedTotals[Number(key)];
    group.cgstAmount = (group.taxableAmount * group.cgstPercent) / 100;
    group.sgstAmount = (group.taxableAmount * group.sgstPercent) / 100;
    group.igstAmount = (group.taxableAmount * group.igstPercent) / 100;
  }

  const finalTotal = Object.values(gstGroupedTotals).reduce(
    (sum, group) =>
      sum +
      group.taxableAmount +
      group.cgstAmount +
      group.sgstAmount +
      group.igstAmount,
    0,
  );

  useEffect(() => {
    const invoiceDate = new Date(invoiceData.date);
    let dueDT = new Date(invoiceDate);
    console.log("Term =============> ", invoiceData.term);
    switch (invoiceData.term) {
      case "Net 45":
        dueDT.setDate(invoiceDate.getDate() + 45);
        break;
      case "Net 60":
        dueDT.setDate(invoiceDate.getDate() + 60);
        break;
      case "Due end of the month":
        dueDT = new Date(
          Date.UTC(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0),
        );
        break;
      case "Due end of the next month":
        dueDT = new Date(
          Date.UTC(invoiceDate.getFullYear(), invoiceDate.getMonth() + 2, 0),
        );
        break;
      case "Due On Receipt":
        dueDT = invoiceDate;
        break;
      case "Custom":
        return;
    }
    console.log("Due Date =====> ", formatDate(dueDT));
    setInvoiceData((prev) => ({ ...prev, dueDate: formatDate(dueDT) }));
  }, [invoiceData.term, invoiceData.date]);

  useEffect(() => {
    getAllCustomer();
    getAll();
    getAllInvoices();
    getCompanyDetails();
  }, []);

  // useEffect(() => {
  //     const baseAmount = isRCM
  //         ? Object.values(gstGroupedTotals).reduce(
  //             (sum, group) => sum + group.taxableAmount,
  //             0
  //         )
  //         : finalTotal;

  //     const autoRound = Math.round(baseAmount) - baseAmount;
  //     setRoundOff(parseFloat(autoRound.toFixed(2)));
  // }, [isRCM, finalTotal, gstGroupedTotals]);

  // useEffect(() => {
  //     if (isManualRoundOff) return;

  //     const baseAmount = isRCM
  //         ? Object.values(gstGroupedTotals).reduce(
  //             (sum, group) => sum + group.taxableAmount,
  //             0
  //         )
  //         : finalTotal;

  //     const autoRound = Math.round(baseAmount) - baseAmount;
  //     setRoundOff(parseFloat(autoRound.toFixed(2)));
  // }, [isRCM, finalTotal, gstGroupedTotals, isManualRoundOff]);
  useEffect(() => {
    if (isManualRoundOff) return;

    const baseAmount = isRCM
      ? Object.values(gstGroupedTotals).reduce(
          (sum, group) => sum + group.taxableAmount,
          0,
        )
      : finalTotal;

    const autoRound = Math.round(baseAmount) - baseAmount;
    const roundedValue = parseFloat(autoRound.toFixed(2));

    setRoundOff(roundedValue);

    // 🔥 IMPORTANT: Sync input buffer
    setRoundOffInput(roundedValue.toFixed(2));
  }, [isRCM, finalTotal, gstGroupedTotals, isManualRoundOff]);

  const getAllInvoices = async () => {
    try {
      const localCompanyId = localStorage.getItem("selectedCompanyId") ?? "";

const params: GetAllParams = {
  keyword: "",
  pageNumber: 0,
  pageSize: 10,
  sortBy: "invoiceId",
  sortDirection: "asc",
  status: true,
  isDeleted: false,
};

let res = await getAllInvoice(localCompanyId, params);
      if (res.success) {
        if (res.data.length > 0) {
          let lastInvoice = res.data[res.data.length - 1];
          console.log("Last Invoice : ", lastInvoice.invoiceNumber);
          let lastNum = parseInt(lastInvoice.invoiceNumber, 10); // "00003" → 3
          let nextNum = lastNum + 1;

          // Pad it with leading zeros to keep 5 digits (e.g., 00004)
          let paddedNum = nextNum.toString().padStart(5, "0");
          setInvoiceData({ ...invoiceData, invoiceNumber: paddedNum });
        }
      }
    } catch (e) {}
  };

  const getAllCustomer = async () => {
    try {
      const localCompanyId = localStorage.getItem("selectedCompanyId") ?? "";
      let res = await fetchAllCustomer(param as GetAllParams, localCompanyId);
      if (res.success) {
        setCustomerData(res.data);
      } else {
        setCustomerData([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  const getCompanyDetails = async () => {
    try {
      const localCompanyId = localStorage.getItem("selectedCompanyId");
      const res = await getCompanyById(localCompanyId ?? "");

      if (res.success) {
        setInvoiceData((prev) => ({
          ...prev,
          commissionerate: res.data?.billingCityName || "",
        }));
      } else {
        setInvoiceData((prev) => ({
          ...prev,
          commissionerate: "",
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getAll = async () => {
    try {
      const localCompanyId = localStorage.getItem("selectedCompanyId");
      let res = await getAllItems(param as GetAllParams, localCompanyId ?? "");
      if (res.success) {
        setItemListData(res.data);
      } else {
        setItemListData([]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // const getMiningForApi = (row: InvoiceProduct): MiningCharges | null => {
  //     const item = itemList.find(
  //         i => i.productId === Number(row.productId)
  //     );

  //     if (!item || !item.miningProduct) return null;

  //     const qty = Number(row.qty);
  //     if (!qty) return null;

  //     const royaltyAmount = qty * Number(item.royalty);
  //     const dmfAmount = (royaltyAmount * Number(item.dmf)) / 100;
  //     const nmetAmount = (royaltyAmount * Number(item.nmet)) / 100;

  //     return {
  //         royalty: Number(item.royalty),
  //         // royaltyAmount,
  //         dmf: Number(item.dmf),
  //         // dmfAmount,
  //         nmet: Number(item.nmet),
  //         // nmetAmount,
  //         // totalMiningAmount: royaltyAmount + dmfAmount + nmetAmount
  //     };
  // };
  // const getMiningForApi = (row: InvoiceProduct): MiningCharges | null => {
  //     const item = itemList.find(
  //         i => i.productId === Number(row.productId)
  //     );

  //     if (!item || !item.miningProduct) return null;

  //     return {
  //         royalty: Number(item.royalty),
  //         dmf: Number(item.dmf),
  //         nmet: Number(item.nmet)
  //     };
  // };

  const getRoyaltyForApi = (row: InvoiceProduct): number | null => {
    const item = itemList.find((i) => i.productId === Number(row.productId));

    if (!item || !item.miningProduct) return null;

    return Number(item.royalty); // ONLY royalty
  };
  const getDMFForApi = (row: InvoiceProduct): number | null => {
    const item = itemList.find((i) => i.productId === Number(row.productId));

    if (!item || !item.miningProduct) return null;

    return Number(item.dmf); // ONLY royalty
  };

  const getNMETForApi = (row: InvoiceProduct): number | null => {
    const item = itemList.find((i) => i.productId === Number(row.productId));

    if (!item || !item.miningProduct) return null;

    return Number(item.nmet); // ONLY royalty
  };

  // async function submit(values: typeof invoiceData, { resetForm }: { resetForm: () => void }) {

  //     const localCompanyId = localStorage.getItem('selectedCompanyId') ?? '';
  //     const items: InvoiceItems[] = rows
  //         .filter(row => row.productId && row.qty) // Optional: skip empty entries
  //         .map(row => ({
  //             productId: parseInt(row.productId),
  //             quantity: row.qty,
  //             rate: row.rate
  //         }));
  //     // const others: OtherCharges[] =  otherCharges.filter(row => row.label && row.rate).map(row=> ({otherCharges: row.label, otherChargesValue: row.rate}));

  //     let req: GenerateInvoiceRequest = {
  //         companyId: parseInt(localCompanyId?.toString()),
  //         customerId: parseInt(values.customerId),
  //         dueDate: values.dueDate,
  //         invoicePrefix: values.invoicePrefix,
  //         invoiceDate: values.date,
  //         paymentMode: values.paymentMode,
  //         terms: values.term,
  //         items: items,
  //         invoiceNumber: values.invoiceNumber,
  //         roundOff: roundOff.toFixed(),
  //         otherCharge: otherCharges,
  //         narration: values.narration,
  //         isRcm: isRCM,
  //         commissionerate: values.commissionerate,
  //         division: values.division,
  //         lrNo: values.lrNo,
  //         range: values.range,
  //         transport: values.transport
  //     }

  //     try {
  //         setIsLoading(true);
  //         const response = await generate(req);
  //         if (response.success) {
  //             router.replace(`${ROUTES.view_invoice}?id=${response.invoiceId}`);
  //             toast.success(`🎉 ${response.message}`, { autoClose: 2000 });
  //         }
  //         else {
  //             toast.error(`🤔 ${response.message}`, { autoClose: 2000 });
  //         }
  //     }
  //     catch (error: any) {
  //         toast.error(`🤔 Something went wrong. Please try again!`, { autoClose: 2000 });
  //     }
  //     finally {
  //         setIsLoading(false);
  //     }
  // }

  async function submit(
    values: typeof invoiceData,
    { resetForm }: { resetForm: () => void },
  ) {
    const localCompanyId = localStorage.getItem("selectedCompanyId") ?? "";

    const items: InvoiceItems[] = rows
      .filter((row) => row.productId && row.qty)
      .map((row) => {
        const baseAmount = row.qty * row.rate;
        // const mining = getMiningForApi(row);

        // const taxableAmount =
        //     baseAmount + (mining?.totalMiningAmount ?? 0);
        const royalty = getRoyaltyForApi(row);
        const dmf = getDMFForApi(row);
        const nmet = getNMETForApi(row);
        return {
          productId: Number(row.productId),
          quantity: row.qty,
          rate: row.rate,
          baseAmount,

          royalty: royalty || 0,
          dmf: dmf || 0,
          nmet: nmet || 0,
          taxableAmount: baseAmount,
        };
      });

    // 🔢 total taxable (all items)
    const totalTaxableAmount = items.reduce(
      (sum, i) => sum + i.taxableAmount,
      0,
    );

    // 🔢 GST totals (already calculated)
    const totalIgst = Object.values(gstGroupedTotals).reduce(
      (sum, d) => sum + d.igstAmount,
      0,
    );

    const totalCgst = Object.values(gstGroupedTotals).reduce(
      (sum, d) => sum + d.cgstAmount,
      0,
    );

    const totalSgst = Object.values(gstGroupedTotals).reduce(
      (sum, d) => sum + d.sgstAmount,
      0,
    );

    const req: GenerateInvoiceRequest = {
      companyId: Number(localCompanyId),
      customerId: Number(values.customerId),
      invoiceDate: values.date,
      dueDate: values.dueDate,
      invoicePrefix: values.invoicePrefix,
      invoiceNumber: values.invoiceNumber,
      paymentMode: values.paymentMode,
      terms: values.term,
      items: items,
      roundOff: Number(roundOff.toFixed(2)).toString(),
      otherCharge: otherCharges,
      narration: values.narration,
      isRcm: isRCM,
      commissionerate: values.commissionerate,
      division: values.division,
      range: values.range,
      lrNumber: values.lrNo,
      transport: values.transport,
    };

    console.log("FINAL REQUEST 👉", req);

    try {
      setIsLoading(true);
      const response = await generate(req);

      if (response.success) {
        const invId = encodeId(response.invoiceId);

        router.replace(`${ROUTES.new_invoice}/${invId}`);
        toast.success(`🎉 ${response.message}`, {
          autoClose: 2000,
        });
        resetForm();
      } else {
        toast.error(`🤔 ${response.message}`, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error(`🤔 Something went wrong`, {
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const otherChargesTotal = otherCharges.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const hasRcmUnit = rows.some((row) => row.taxPref.toLowerCase() === "rcm");

  const handleSelectChange = (idx: number, value: string) => {
    if (value === "add_new") {
      setIsAddItemModalOpen(true);
    } else {
      handleItemChange(idx, value); // your existing logic
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center p-5 ">
        {isLoading && <Loader />}
        <h1 className="text-3xl font-bold text-center text-black mb-10">
          New Invoice
        </h1>
        <div className="w-[100%] border rounded-md bg-white p-5 text-black">
          <Formik
            validationSchema={validateSchema}
            initialValues={invoiceData}
            onSubmit={submit}
            enableReinitialize
          >
            {({ values, handleChange, setFieldValue, errors }) => (
              <Form>
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="w-full col-span-1 md:col-span-1">
                      <CustomLabel title="Invoice #" isCompulsory />
                      <div className="flex gap-2">
                        <div className="w-[25%]">
                          <TextField
                            placeholder="Prefix"
                            name="invoicePrefix"
                            value={values.invoicePrefix}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="invoicePrefix"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="w-[75%] relative">
                          <TextField
                            name="invoiceNumber"
                            placeholder="Number"
                            value={values.invoiceNumber}
                            onChange={handleChange}
                            className="pr-10"
                          />
                          <ErrorMessage
                            name="invoiceNumber"
                            component="div"
                            className="text-red-600 text-sm mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Invoice Date"
                        name="date"
                        type="date"
                        value={values.date}
                        onChange={handleChange}
                        isCompulsory
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="text-red-600 text-sm mt-1"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <CustomLabel title="Term" isCompulsory />
                      <div className="relative w-full mt-1">
                        <select
                          name="term"
                          value={values.term}
                          onChange={(e) => {
                            const selectedTerm = e.target.value;
                            setFieldValue("term", selectedTerm);
                            const invoiceDate = new Date(values.date);
                            let dueDT = new Date(invoiceDate);

                            switch (selectedTerm) {
                              case "Net 45":
                                dueDT.setDate(invoiceDate.getDate() + 45);
                                break;
                              case "Net 60":
                                dueDT.setDate(invoiceDate.getDate() + 60);
                                break;
                              case "Due end of the month":
                                dueDT = new Date(
                                  Date.UTC(
                                    invoiceDate.getFullYear(),
                                    invoiceDate.getMonth() + 1,
                                    0,
                                  ),
                                );
                                break;
                              case "Due end of the next month":
                                dueDT = new Date(
                                  Date.UTC(
                                    invoiceDate.getFullYear(),
                                    invoiceDate.getMonth() + 2,
                                    0,
                                  ),
                                );
                                break;
                              case "Due On Receipt":
                                dueDT = new Date(invoiceDate); // Due date is the same as invoice date
                                break;
                              case "Custom":
                                return;
                              default:
                                return;
                            }

                            setFieldValue("dueDate", formatDate(dueDT));
                          }}
                          className="block w-full rounded-md border bg-white focus:outline-none border-gray-300 py-2 px-2 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 font-inter"
                        >
                          {terms.map((term: string, index: number) => (
                            <option key={index} value={term}>
                              {term}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        value={values.dueDate}
                        onChange={handleChange}
                        isCompulsory
                      />
                      <ErrorMessage
                        name="dueDate"
                        component="div"
                        className="text-red-600 text-sm mt-1"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <CustomLabel title="Customer Name" isCompulsory />
                      <div className="relative w-full mt-1">
                        <select
                          name="customerId"
                          value={values.customerId || ""}
                          onChange={(e) => {
                            if (e.target.value === "add_new_cus") {
                              setIsAddCustomerModalOpen(true);
                            } else {
                              const selectedId = e.target.value;
                              const selectedCustomer = customerData.find(
                                (c) => c.customerId.toString() === selectedId,
                              );
                              const shippingState =
                                selectedCustomer?.placeOfSupplyStateName;
                              if (shippingState != "Gujarat") {
                                setIsOutOfGujarat(true);
                              }
                              setFieldValue(
                                "customerId",
                                selectedCustomer?.customerId || "",
                              );
                              setFieldValue(
                                "customerName",
                                selectedCustomer
                                  ? `${selectedCustomer.customerCompanyName}`
                                  : "",
                              );
                            }
                          }}
                          className="block w-full rounded-md border focus:outline-none border-gray-300 py-2 px-2 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-300 bg-white placeholder:text-gray-400 sm:text-sm sm:leading-6 font-inter"
                        >
                          <option value="">Select Customer</option>
                          {customerData.map((customer) => (
                            <option
                              key={customer.customerId}
                              value={customer.customerId}
                            >
                              {customer.customerCompanyName}
                            </option>
                          ))}
                          <option
                            value="add_new_cus"
                            className="bg-[#af0000] text-white"
                          >
                            {" "}
                            Add New Customer
                          </option>
                        </select>
                      </div>
                      <ErrorMessage
                        name="customerId"
                        component="div"
                        className="text-red-600 text-sm mt-1"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <CustomLabel title="Payment Mode" isCompulsory />
                      <div className="relative w-full mt-1">
                        <select
                          value={values.paymentMode}
                          onChange={handleChange}
                          name="paymentMode"
                          className="block w-full rounded-md border focus:outline-none border-gray-300 py-2 px-2 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-300 bg-white placeholder:text-gray-400 sm:text-sm sm:leading-6 font-inter"
                        >
                          <option value="">Select Payment Mode</option>
                          {paymentMode.map((mode: string, index: number) => (
                            <option key={index} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ErrorMessage
                        name="paymentMode"
                        component="div"
                        className="text-red-600 text-sm mt-1"
                      />
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="L R No"
                        name="lrNo"
                        type="text"
                        value={values.lrNo}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Transport"
                        name="transport"
                        type="text"
                        value={values.transport}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Range"
                        name="range"
                        type="text"
                        value={values.range}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Division"
                        name="division"
                        type="text"
                        value={values.division}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <TextField
                        label="Commissionerate"
                        name="commissionerate"
                        type="text"
                        value={values.commissionerate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-700 font-inter">
                        Invoice Items
                      </h3>
                    </div>
                    <div className="">
                      <table className="min-w-full text-sm border border-gray-200 rounded overflow-hidden text-black">
                        <thead className="bg-gray-100">
                          <tr className="text-sm">
                            <td className="px-3 py-2">Item Details</td>
                            <td className="px-3 py-2 w-[10%]">Quantity</td>
                            <td className="px-3 py-2">Rate</td>
                            <td className="px-3 py-2 text-right w-15">GST</td>
                            <td className="px-3 py-2 text-right">Amount</td>
                            <td className="px-3 py-2 w-10"></td>
                          </tr>
                        </thead>

                        <tbody>
                          {rows.map((row, idx) => {
                            const miningRows = getMiningRows(row);

                            return (
                              <React.Fragment key={idx}>
                                <tr className="border-t border-gray-200">
                                  <td className="p-1">
                                    <select
                                      value={row.productId}
                                      onChange={(e) => {
                                        handleSelectChange(idx, e.target.value);
                                      }}
                                      className="w-full border bg-white py-1 focus:border-red-500 focus:ring-1 focus:ring-red-300 border-gray-300 rounded px-2 text-sm appearance-none"
                                    >
                                      <option value="">Select an item</option>
                                      {itemList.map((item: GetAllItemData) => (
                                        <option
                                          key={item.productId}
                                          value={item.productId}
                                        >
                                          {item.productName}
                                        </option>
                                      ))}
                                      <option
                                        value="add_new"
                                        className="bg-[#af0000] text-white"
                                      >
                                        {" "}
                                        Add New Item
                                      </option>
                                    </select>
                                  </td>

                                  <td className="p-2 text-right w-[200px]">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      className="w-full text-right border rounded px-2 py-1"
                                      value={
                                        qtyInput[idx] !== undefined
                                          ? qtyInput[idx]
                                          : rows[idx].qty.toString()
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9.,]*$/.test(value)) return;

                                        setQtyInput((prev) => ({
                                          ...prev,
                                          [idx]: value,
                                        }));

                                        const cleaned = value.replace(/,/g, "");
                                        const num = parseFloat(cleaned);

                                        if (!isNaN(num)) {
                                          handleQtyChange(idx, num);
                                        } else if (
                                          value === "" ||
                                          value === "."
                                        ) {
                                          handleQtyChange(idx, 0);
                                        }
                                      }}
                                    />
                                  </td>

                                  <td className="p-2 text-right">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      placeholder="0"
                                      className="w-full border rounded px-2 py-1 text-right"
                                      value={
                                        rateInput[idx] !== undefined
                                          ? rateInput[idx]
                                          : (rows[idx].rate?.toString() ?? "")
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        if (!/^\d*\.?\d*$/.test(value)) return;

                                        setRateInput((prev) => ({
                                          ...prev,
                                          [idx]: value,
                                        }));

                                        const parsed = parseFloat(value);

                                        const updatedRows = [...rows];

                                        if (!isNaN(parsed)) {
                                          updatedRows[idx].rate = parsed;
                                          updatedRows[idx].amount =
                                            parsed *
                                            (updatedRows[idx].qty || 0);
                                        } else {
                                          updatedRows[idx].rate = 0;
                                          updatedRows[idx].amount = 0;
                                        }

                                        setRows(updatedRows);
                                      }}
                                    />
                                  </td>

                                  <td className="p-2 text-right">
                                    {row.gstPer === "NaN%" ? "0%" : row.gstPer}
                                  </td>

                                  <td className="p-2 text-right font-semibold w-72">
                                    ₹{" "}
                                    {row.amount.toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>

                                  <td className="text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(idx)}
                                      className="text-red-500 text-sm hover:underline"
                                    >
                                      ✖
                                    </button>
                                  </td>
                                </tr>

                                {miningRows.map((mRow, i) => (
                                  <tr key={i} className="">
                                    <td className="p-1">
                                      <div className="py-1 border rounded px-2">
                                        {mRow.label}
                                      </div>
                                    </td>

                                    <td className="p-2">
                                      <input
                                        className="px-2 py-1 border rounded w-full"
                                        disabled
                                      />
                                    </td>
                                    <td className="p-2 text-right">
                                      <div className="border rounded px-2 py-1">
                                        {mRow.rate}
                                      </div>
                                    </td>
                                    <td className="p-2"></td>
                                    <td className="p-2 text-right">
                                      <div className="border rounded px-2 py-1">
                                        ₹{" "}
                                        {mRow.value.toLocaleString("en-IN", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className={`bg-[#af0000] text-white px-4 py-2 rounded hover:bg-red-600 text-sm`}
                        >
                          + Add New Row
                        </button>
                      </div>

                      <div className="w-full mt-4 flex items-center gap-2 justify-end">
                        <input
                          type="checkbox"
                          className="w-5 h-5"
                          checked={isRCM}
                          onChange={(e) => {
                            setIsRCM(e.target.checked);
                          }}
                        />{" "}
                        <span className="text-base">
                          This transaction is applicable for reverse charge
                        </span>
                      </div>
                      {/* <div className="mt-4 flex flex-col lg:flex-row justify-between items-start gap-4">
                 
                        <div className="flex flex-col w-full max-w-5xl gap-4">
                          <div className="bg-gray-100 p-2 rounded-md border border-gray-300">
                            <table className="min-w-full table-auto text-black">
                              <thead>
                                <tr className="bg-gray-100">
                                  <td className="py-2 text-left text-sm">
                                    GST Rate
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    Taxable Amount (₹)
                                  </td>

                                  <td className="px-4 py-2 text-left text-sm">
                                    IGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    IGST Amount (₹)
                                  </td>

                                  <td className="px-4 py-2 text-left text-sm">
                                    CGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    CGST Amount (₹)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    SGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    SGST Amount (₹)
                                  </td>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(gstGroupedTotals).map(
                                  ([gstRate, data]) => (
                                    <tr
                                      key={gstRate}
                                      className="bg-white hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {gstRate}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.taxableAmount.toFixed(2)}
                                      </td>

                                      <td className="px-4 py-2 text-sm">
                                        {data.igstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.igstAmount.toFixed(2)}
                                      </td>

                                      <td className="px-4 py-2 text-sm">
                                        {data.cgstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.cgstAmount.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.sgstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.sgstAmount.toFixed(2)}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>

                          <div className="w-full">
                            <label
                              htmlFor="narration"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Narration / Remarks:
                            </label>
                            <textarea
                              id="narration"
                              rows={5}
                              value={values.narration}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-blue-500 text-sm"
                              placeholder="Enter remarks or narration here..."
                            ></textarea>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-md border border-gray-300 w-full max-w-md">
                          <div className="flex justify-between text-sm text-gray-800">
                            <h4 className="text-base font-semibold mb-2 text-gray-700">
                              Total Taxable Amount
                            </h4>
                            <div>
                              ₹{" "}
                              {Object.values(gstGroupedTotals)
                                .reduce(
                                  (sum, data) => sum + data.taxableAmount,
                                  0,
                                )
                                .toFixed(2)}
                            </div>
                          </div>

                          <div className="flex justify-between text-sm text-gray-800">
                            <div>Total IGST</div>
                            <div>
                              ₹{" "}
                              {Object.values(gstGroupedTotals)
                                .reduce((sum, data) => sum + data.igstAmount, 0)
                                .toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-800 mt-1">
                            <div>Total CGST</div>
                            <div>
                              ₹{" "}
                              {Object.values(gstGroupedTotals)
                                .reduce((sum, data) => sum + data.cgstAmount, 0)
                                .toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-800 mt-1">
                            <div>Total SGST</div>
                            <div>
                              ₹{" "}
                              {Object.values(gstGroupedTotals)
                                .reduce((sum, data) => sum + data.sgstAmount, 0)
                                .toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-800 mt-2">
                            <div>Round Off</div>
                            <div>
                           
                              <input
                                type="text"
                                inputMode="decimal"
                                className="border px-2 py-1 w-24 rounded text-right"
                                value={roundOffInput}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (!/^-?[0-9.]*$/.test(value)) return;

                                  setRoundOffInput(value);

                                  if (
                                    value === "" ||
                                    value === "-" ||
                                    value === "."
                                  ) {
                                    setRoundOff(0);
                                    return;
                                  }

                                  const num = parseFloat(value);

                                  setRoundOff(isNaN(num) ? 0 : num);
                                  setIsManualRoundOff(true);
                                }}
                                onBlur={() => {
                                  setRoundOffInput(roundOff.toFixed(2));
                                }}
                              />
                            </div>
                          </div>

                          {otherCharges.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm text-gray-800 mt-2"
                            >
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) =>
                                  handleOtherChange(
                                    index,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                className="border px-2 py-1 w-32 rounded"
                                placeholder="Label"
                              />
                              <div>
                                <input
                                  type="number"
                                  value={item.value}
                                  onChange={(e) =>
                                    handleOtherChange(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="border px-2 py-1 w-24 rounded text-right"
                                  placeholder="0.00"
                                />
                                <span>
                                  {" "}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOtherRow(index)}
                                    className="text-red-500 text-xs hover:underline ml-1.5"
                                  >
                                    ✖
                                  </button>
                                </span>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={handleAddOtherRow}
                            className="text-sm px-3 py-1 bg-[#af0000] text-white rounded hover:bg-red-600 mt-3"
                          >
                            Add Others
                          </button>

                          <div className="border-t mt-3 pt-2 font-bold text-gray-900 flex justify-between">
                            <div>Grand Total</div>
                         
                            <div>
                              ₹{" "}
                              {isRCM
                                ? (
                                    Object.values(gstGroupedTotals).reduce(
                                      (sum, data) => sum + data.taxableAmount,
                                      0,
                                    ) + roundOff
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : (
                                    finalTotal +
                                    roundOff -
                                    otherChargesTotal
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                            </div>
                          </div>
                        </div>
                      </div> */}
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Left Side: Table and Narration (8 columns out of 12) */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                          {/* Table Section with Horizontal Scroll */}
                          <div className="bg-gray-100 p-2 rounded-md border border-gray-300 overflow-x-auto shadow-sm">
                            <table className="min-w-full table-auto text-black">
                              <thead>
                                <tr className="bg-gray-100">
                                  <td className="py-2 text-left text-sm">
                                    GST Rate
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    Taxable Amount (₹)
                                  </td>

                                  <td className="px-4 py-2 text-left text-sm">
                                    IGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    IGST Amount (₹)
                                  </td>

                                  <td className="px-4 py-2 text-left text-sm">
                                    CGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    CGST Amount (₹)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    SGST (%)
                                  </td>
                                  <td className="px-4 py-2 text-left text-sm">
                                    SGST Amount (₹)
                                  </td>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {Object.entries(gstGroupedTotals).map(
                                  ([gstRate, data]) => (
                                    <tr
                                      key={gstRate}
                                      className="bg-white hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {gstRate}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.taxableAmount.toFixed(2)}
                                      </td>

                                      <td className="px-4 py-2 text-sm">
                                        {data.igstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.igstAmount.toFixed(2)}
                                      </td>

                                      <td className="px-4 py-2 text-sm">
                                        {data.cgstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.cgstAmount.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.sgstPercent}%
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {data.sgstAmount.toFixed(2)}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Narration Section */}
                          <div className="w-full">
                            <label
                              htmlFor="narration"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Narration / Remarks:
                            </label>
                            <textarea
                              id="narration"
                              rows={4}
                              value={values.narration}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm"
                              placeholder="Enter remarks or narration here..."
                            ></textarea>
                          </div>
                        </div>

                        {/* Right Side: Total Summary Card (4 columns out of 12) */}
                        <div className="lg:col-span-4 bg-gray-100 p-4 rounded-md border border-gray-300 shadow-sm">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-bold text-gray-700">
                                Total Taxable Amount
                              </h4>
                              <span className="text-sm font-bold">
                                ₹{" "}
                                {Object.values(gstGroupedTotals)
                                  .reduce(
                                    (sum, data) => sum + data.taxableAmount,
                                    0,
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-800">
                              <div>Total IGST</div>
                              <div>
                                ₹{" "}
                                {Object.values(gstGroupedTotals)
                                  .reduce(
                                    (sum, data) => sum + data.igstAmount,
                                    0,
                                  )
                                  .toFixed(2)}
                              </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-800 mt-1">
                              <div>Total CGST</div>
                              <span>
                                ₹{" "}
                                {Object.values(gstGroupedTotals)
                                  .reduce(
                                    (sum, data) => sum + data.cgstAmount,
                                    0,
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-800 mt-1">
                              <div>Total SGST</div>
                              <span>
                                ₹{" "}
                                {Object.values(gstGroupedTotals)
                                  .reduce(
                                    (sum, data) => sum + data.sgstAmount,
                                    0,
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-800 mt-2">
                              <div className="text-sm font-medium">
                                Round Off
                              </div>
                              <input
                                type="text"
                                className="border border-gray-300 px-2 py-1 w-24 rounded text-right text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                value={roundOffInput}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!/^-?[0-9.]*$/.test(val)) return;
                                  setRoundOffInput(val);
                                  const num = parseFloat(val);
                                  setRoundOff(isNaN(num) ? 0 : num);
                                }}
                                onBlur={() =>
                                  setRoundOffInput(roundOff.toFixed(2))
                                }
                              />
                            </div>
                            {/* 
                            <div className="space-y-2">
                              {otherCharges.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex gap-2 items-center"
                                >
                                  <input
                                    type="text"
                                    value={item.label}
                                    className="border border-gray-300 px-2 py-1 flex-1 rounded text-xs"
                                    placeholder="Label"
                                    onChange={(e) =>
                                      handleOtherChange(
                                        index,
                                        "label",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    value={item.value}
                                    className="border border-gray-300 px-2 py-1 w-20 rounded text-right text-xs"
                                    placeholder="0.00"
                                    onChange={(e) =>
                                      handleOtherChange(
                                        index,
                                        "value",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOtherRow(index)}
                                    className="text-red-500 hover:scale-110"
                                  >
                                    ✖
                                  </button>
                                </div>
                              ))}
                            </div> */}
                            {/* Other Charges List Section */}
                            <div className="space-y-3 mt-2">
                              {otherCharges.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 mt-2"
                                >
                                  <input
                                    type="text"
                                    value={item.label}
                                    placeholder="Label"
                                    onChange={(e) =>
                                      handleOtherChange(
                                        index,
                                        "label",
                                        e.target.value,
                                      )
                                    }
                                    className="border px-2 py-1 flex-1 min-w-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <input
                                    type="number"
                                    value={item.value}
                                    placeholder="0.00"
                                    onChange={(e) =>
                                      handleOtherChange(
                                        index,
                                        "value",
                                        e.target.value,
                                      )
                                    }
                                    className="border px-2 py-1 w-16 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOtherRow(index)}
                                    className="text-red-500 font-bold px-1 hover:bg-red-50 rounded"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={handleAddOtherRow}
                              className="text-sm px-3 py-1 bg-[#af0000] text-white rounded hover:bg-red-600 mt-3"
                            >
                              Add Others
                            </button>

                            <div className="border-t mt-3 pt-2 font-bold text-gray-900 flex justify-between">
                              <span>Grand Total</span>
                              <span>
                                ₹{" "}
                                {isRCM
                                  ? (
                                      Object.values(gstGroupedTotals).reduce(
                                        (sum, d) => sum + d.taxableAmount,
                                        0,
                                      ) + roundOff
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })
                                  : (
                                      finalTotal +
                                      roundOff -
                                      otherChargesTotal
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 w-full flex items-center justify-center gap-5">
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium font-inter shadow-lg"
                    >
                      Save
                    </button>
                    <button
                      type="submit"
                      className="w-full md:w-auto  bg-[#03508C] text-white hover:bg-[#0874CB] px-6 py-2 rounded-lg font-medium font-inter transition-colors shadow-lg"
                      onClick={() => {
                        router.back();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded">
            <AddNewItem
              isModalOpen={isAddItemModalOpen}
              onClick={() => {
                setIsAddItemModalOpen(false);
                getAll();
              }}
            />
          </div>
        </div>
      )}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4">
            <div className="bg-white rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <Customer
                isModalOpen={isAddCustomerModalOpen}
                onClick={() => {
                  getAllCustomer();
                  setIsAddCustomerModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* <PreviewInvoice invoiceData={invoiceData} /> */}
      {/* <PreviewInvoicePDF invoiceData={invoiceData} /> */}
    </>
  );
};

export default GenerateInvoice;
