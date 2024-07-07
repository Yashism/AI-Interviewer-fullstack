// apiService.ts

import axios from "axios";
import api from "./axiosInterface";
const BASE_URL = "http://localhost:8000";

interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password1: string;
  password2: string;
  email: string;
}

/**
 * Performs a login request using the provided login data.
 * @param loginData - The login data to be sent in the request.
 * @returns A Promise that resolves to the response data from the login request.
 * @throws If an error occurs during the login request.
 */
export const performLogin = async (loginData: LoginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/accounts/login/`, loginData);
    if (response.data.access) {
      console.log("response", response.data.access);
      localStorage.setItem("accessToken", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refreshToken", response.data.refresh);
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Performs user signup by sending a POST request to the server.
 * @param signupData - The data required for user signup.
 * @returns A Promise that resolves to the response data from the server.
 * @throws If an error occurs during the signup process.
 */
export const performSignup = async (signupData: SignupData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/accounts/registration/`,
      signupData,
    );
    if (response.data.access) {
      console.log("response", response.data.access);
      localStorage.setItem("accessToken", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refreshToken", response.data.refresh);
    }

    return response.data;
  } catch (error) {
console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Fetches user data using the provided user ID.
 * @returns A Promise that resolves to the user data.
 * @throws If an error occurs during the fetch request.
 */
export const fetchUser = async () => {
  try {
    const response = await api.get(`${BASE_URL}/accounts/user/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    // throw error;
  }
};

export const updateUserData = async (data: any) => {
  try {
    const response = await api.put(`${BASE_URL}/accounts/profile/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user data:", error);
    // throw error;
  }
};
