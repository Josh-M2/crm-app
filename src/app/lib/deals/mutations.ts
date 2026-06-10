import axiosInstance from "../axiosInstance";
import {
  AddDealTypes,
  UpdateDealTypes,
  DeleteDealTypes,
} from "@/app/types/deals";

export const addDeal = async (url: string, { arg }: { arg: AddDealTypes }) => {
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(response.data.error);
  return "ok";
};

export const updateDeal = async (
  url: string,
  { arg }: { arg: UpdateDealTypes }
) => {
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(response.data.error);
  return "ok";
};

export const deleteDeal = async (
  url: string,
  { arg }: { arg: DeleteDealTypes }
) => {
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(response.data.error);
  return "ok";
};
