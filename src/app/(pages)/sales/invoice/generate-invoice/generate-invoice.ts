"use server";

import { SERVER_URL } from "@/core/constants";
import { API_DATABASE_ENDPOINT } from "@/core/constants/api_endpoint";
import axios from "axios";
import { auth } from "../../../../../../auth";
import { CustomerData } from "../../../customer/customer";
import { MiningCharges, OtherCharges } from "@/app/types/invoice";
import { Update } from "next/dist/build/swc/types";
import { SummeryReportData } from "@/app/(pages)/reports/reports";

export interface GenerateInvoiceResponse {
  success: boolean;
  successCode: string;
  message: string;
  invoiceId: number;
}

export interface GenerateInvoiceRequest {
  companyId: number;
  customerId: number;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  paymentMode: string;
  items: InvoiceItems[];
  invoicePrefix: string;
  invoiceNumber: string;
  roundOff: string;
  otherCharge: OtherCharges[];
  narration: string;
  isRcm: boolean;
  lrNumber: string;
  transport: string;
  range: string;
  division: string;
  commissionerate: string;
  // totalTaxableAmount: number;
  // totalCgst: string;
  // totalSgst: string;
  // totalIgst: string;
  // grandTotal: string;
}

export interface UpdateInvoiceRequest {
  companyId: number;
  customerId: number;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  paymentMode: string;
  items: InvoiceItems[];
  invoicePrefix: string;
  invoiceNumber: string;
  roundOff: number;
  otherCharge: OtherCharges[];
  narration: string;
  isRcm: boolean;
  lrNumber: string;
  transport: string;
  range: string;
  division: string;
  commissionerate: string;
}

export interface InvoiceItems {
  productId: number;
  quantity: number;
  rate: number;
  baseAmount: number;
  // mining?: MiningCharges;
  royalty: number;
  dmf: number;
  nmet: number;
  taxableAmount: number;
}

export interface GetAllInvoiceResponse {
  success: boolean;
  successCode: string;
  // data: InvoiceData[];
  data: SummeryReportData[];
}

export interface InvoiceDetailsResponse {
  success: boolean;
  successCode: string;
  data: InvoiceData;
}

export interface InvoiceData {
  invoiceId: number;
  invoicePrefix: string;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  paymentMode: string;
  narration: string;
  items: ItemDetails[];
  otherCharge: OtherChargeDetails[];
  totalTaxableAmount: number;
  totalIgst: number;
  totalCgst: number;
  totalSgst: number;
  roundOff: number;
  grandTotal: number;
  status: boolean;
  isDeleted: boolean;
  isRCM: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
  companyId: number;
  customerId: number;
  customer: CustomerData;
  lrNumber: string;
  transport: string;
  range: string;
  division: string;
  commissionerate: string;
}

export interface ItemDetails {
  productId: number;
  quantity: number;
  rate: number;
  taxableAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  product: Product;
}

export interface OtherChargeDetails {
  otherChargeId: number;
  label: string;
  value: string;
  invoiceId: string;
}

export interface Product {
  productId: number;
  productName: string;
  type: string;
  hsnCode: string;
  sacCode: string;
  unit: string;
  taxPreference: string;
  sellingPrice: string;
  quantity: any;
  rate: any;
  taxValue: any;
  gstPercent: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  netAmount: string;
  description: string;
  miningProduct: boolean;
  royalty: any;
  dmf: null;
  nmet: null;
  status: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  companyId: number;
}

export interface DeleteInvoiceResponse {
  success: boolean;
  successCode: string;
  message: string;
}

export interface InvoiceRestoreResponse {
  success: boolean;
  successCode: string;
  message: string;
}

export async function generate(
  req: GenerateInvoiceRequest,
): Promise<GenerateInvoiceResponse> {
  try {
    console.log("Request : ", req);
    const res = await axios.post(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.generate}`,
      req,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );

    if (res.data == undefined) {
      throw Error("Add New Item Failed");
    }

    return res.data;
  } catch (e: any) {
    console.error("Add New Item Error:", e);
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}

export async function updateInvoice(
  req: UpdateInvoiceRequest,
  id: string,
): Promise<GenerateInvoiceResponse> {
  try {
    console.log("Invoice ID for Update:", id);
    console.log("Request : ", req);
    const res = await axios.put<GenerateInvoiceResponse>(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.generate}/${id}`,
      req,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );

    if (res.data == undefined) {
      throw Error("Add New Item Failed");
    }

    return res.data;
  } catch (e: any) {
    console.error("Add New Item Error:", e);
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}

export async function getAllInvoiceById({
  id,
}: {
  id: string;
}): Promise<InvoiceDetailsResponse> {
  try {
    console.log(`${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.getById}${id}`);
    console.log(
      "Auth Token:",
      (await auth())?.user.authToken ?? "No Auth Token",
    );
    const res = await axios.get(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.getById}${id}`,
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );
    console.log("Get Invoice By ID Response:", res.data);
    if (res.data == undefined) {
      throw Error("Get Invoice Details Failed");
    }
    console.log("Get Invoice By ID Response:", res.data);
    return res.data;
  } catch (e: any) {
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}

export async function getAllInvoice(
  localCompanyId: string,
): Promise<GetAllInvoiceResponse> {
  try {
    console.log( `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.getAll}?companyId=${localCompanyId}`)
    const res = await axios.get(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.invoiceReport}?companyId=${localCompanyId}`,
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );

    if (res.data == undefined) {
      throw Error("Get Invoice Details Failed");
    }
    return res.data;
  } catch (e: any) {
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}

export async function deleteInvoice({
  id,
}: {
  id: string;
}): Promise<DeleteInvoiceResponse> {
  try {
    let response = await axios.put(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.softDelete}${id}`,
      {},
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );

    console.log("Response =====> ", response.data);
    if (response.data === undefined) {
      throw Error("Response Failed");
    }
    return response.data;
  } catch {
    throw Error("Failure");
  }
}

export async function restoreInvoice(
  id: string,
): Promise<InvoiceRestoreResponse> {
  try {
    let response = await axios.put(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.restoreInvoice}${id}`,
      {},
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );
    if (response.data == undefined) {
      throw Error("Restore Item Failed");
    }

    return response.data;
  } catch (e) {
    throw Error("Failure");
  }
}

export async function getAllDeletedInvoice(
  localCompanyId: string,
): Promise<GetAllInvoiceResponse> {
  try {
    const res = await axios.get(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.invoice.softDeleted}?companyId=${localCompanyId}`,
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );

    if (res.data == undefined) {
      throw Error("Get Invoice Details Failed");
    }
    return res.data;
  } catch (e: any) {
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}
