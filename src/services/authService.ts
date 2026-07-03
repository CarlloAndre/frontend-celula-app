import api from "./api";
import { AdminAuth } from "../types";

export const login = async (
  username: string,
  password: string
): Promise<AdminAuth> => {
  const { data } = await api.post<AdminAuth>("/auth/login", {
    username,
    password,
  });
  return data;
};
