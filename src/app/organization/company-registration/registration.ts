"use server";

import { SERVER_URL } from "@/core/constants";
import { auth } from "../../../../auth";
import { apiServiceInstance } from "@/core/service/apis";
import { API_ENDPOINTS } from "@/core/constants/api_endpoint";
import axios from "axios";

export interface CompanyRegistrationResponse {
  success: boolean;
  successCode: string;
  message: string;
}

export interface CompanyRegRequest {
  companyName: string;
  ownerName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingAddress3: string;
  billingStateId: string;
  billingCityId: string;
  billingPincode: string;
  // shippingAddress1: string;
  // shippingAddress2: string;
  // shippingAddress3: string;
  // shippingStateId: string;
  // shippingCityId: string;
  // shippingPincode: string;
  panNumber: string;
  gstNumber: string;
  industry: string;
  bankName: string;
  accHolderName: string;
  ifscCode: string;
  branch: string;
  accountNumber: string;
  bankAddress: string;
  password: string;
  mobileNumber: string;
  email: string;
  cinNumber: string;
  alternateMobileNumber: string;
}
export interface BankDetails {
  bankName: string;
  accHolderName: string;
  ifscCode: string;
  branch: string;
  accountNumber: string;
  bankAddress: string;
  status: boolean;
}

export async function companyReg(
  file: File | null,
  reqData: CompanyRegRequest,
): Promise<CompanyRegistrationResponse> {
  try {
    const formData = new FormData();

    Object.entries(reqData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (file) {
      formData.append("logoFile", file);
    }

    const token = (await auth())?.user.authToken ?? "";

    const res = await axios.post(
      `${SERVER_URL}/${API_ENDPOINTS.companyReg}`,
      formData,
      {
        headers: {
          Authorization: token, // Bearer xxx
        },
      },
    );

    // ✅ backend success response 그대로 return
    return res.data;
  } catch (error: any) {
    console.error("Company Registration API Error:", error);

    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;

      return {
        success: data?.success ?? false,
        successCode: data?.successCode ?? "REGISTRATION_FAILED",
        message: data?.message ?? "Company registration failed",
      };
    }

    return {
      success: false,
      successCode: "SERVER_ERROR",
      message: "Server not reachable",
    };
  }
}

export async function companyUpdate(
  file: File | null,
  reqData: CompanyRegRequest,
  id: string,
): Promise<CompanyRegistrationResponse> {
  try {
    const formData = new FormData();
    Object.entries(reqData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    console.log("Form Data Entries:", id);
    if (file !== null) {
      formData.append("logoFile", file);
    }
    // formData.append("bankStatus", "true");
    const token = (await auth())?.user.authToken ?? "";
    // console.log(token);
    console.log("Authentication Token ==========> ", token);
    // const res = await axios.put(`${SERVER_URL}/${API_ENDPOINTS.companyUpdate}${id}`,
    //     formData,
    //     {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //             Authorization: `${token}`,
    //         },
    //     }
    // );

    // console.log('Response ===> ', res.data)
    // if (res.data == undefined) {
    //     throw Error("Updated Failed");
    // }
    // return res.data;
    const endpoint = `${SERVER_URL}${API_ENDPOINTS.companyUpdate}${id}`;
    console.log(SERVER_URL + API_ENDPOINTS.companyUpdate + id);
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "Updated failed");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Company Registration API Error:", error);

    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;

      return {
        success: data?.success ?? false,
        successCode: data?.successCode ?? "UPDATE_FAILED",
        message: data?.message ?? "Company update failed",
      };
    }

    return {
      success: false,
      successCode: "SERVER_ERROR",
      message: "Server not reachable",
    };
  }
}
