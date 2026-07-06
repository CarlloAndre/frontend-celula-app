import api from "./api";
import { AdminAuth } from "../types";
import { getCurrentTorneoId } from "./torneoStore";

export const login = async (
  username: string,
  password: string
): Promise<AdminAuth> => {
  const { data } = await api.post<AdminAuth>("/auth/login", {
    torneoId: getCurrentTorneoId(),
    username,
    password,
  });
  return data;
};
