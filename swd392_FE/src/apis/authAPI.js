import axios from "axios";
import { BASE_URL } from "../configs/globalVariables";

export const loginAPI = async (data) => {
  return await axios.post(`${BASE_URL}/login`, data);
};

export const handleLogoutAPI = async () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return Promise.resolve();
};

export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  return await axios.post(`${BASE_URL}/refresh`, { token: refreshToken });
};