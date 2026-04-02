"use server";

import axios from "axios";
import { auth } from "../../../../auth";
import { SERVER_URL } from "@/core/constants";
import { API_DATABASE_ENDPOINT } from "@/core/constants/api_endpoint";

export const getInvoiceReport = async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/invoice/invoice-report`, {
      headers: {
        Authorization: (await auth())?.user.authToken || "",
      },
      responseType: "arraybuffer",
    });

    const base64Data = Buffer.from(response.data).toString("base64");
    return { success: true, data: base64Data };
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    return { success: false, error: "ડાઉનલોડ નિષ્ફળ રહ્યું" };
  }
};

export interface GetSummeryReportResponse {
  success: boolean;
  successCode?: string;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  isLastPage?: boolean;
  data: SummeryReportData[];
}

export interface SummeryReportData {
  invoiceId: number;
  date: string;
  particulars: string;
  invoiceType: any;
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
}
export async function getAllSummeryReport(): Promise<GetSummeryReportResponse> {
  try {
    const res = await axios.get<GetSummeryReportResponse>(
      `${SERVER_URL}${API_DATABASE_ENDPOINT.summery.getSummeryReport}`,
      {
        headers: {
          Authorization: (await auth())?.user.authToken ?? "",
        },
      },
    );
    console.log("Get All Invoice Report Response:", res.data);
    if (res.data == undefined) {
      throw Error("Get Invoice Details Failed");
    }
    return res.data;
  } catch (e: any) {
    throw Error(e?.response?.data?.message || e?.message || "Failed");
  }
}
