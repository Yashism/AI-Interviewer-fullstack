// lib/auth.ts

import { NextRequest } from "next/server";

const getTokenFromLocalStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("accessToken");
};

// const checkToken = async (token: string) => {}

export async function checkAuth(req: NextRequest): Promise<boolean> {
  // const token = req.headers.authorization;
  const token = getTokenFromLocalStorage();

  if (!token || token === "null") {
    return false;
  }

  // Perform authentication logic here

  return true;
}

export function authStatus() {
  const token = getTokenFromLocalStorage();
  
  if (!token) {
    return false;
  }
  return true;
}
