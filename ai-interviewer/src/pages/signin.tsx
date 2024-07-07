import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import "../styles/globals.css";
import { performLogin } from "@/lib/apiService";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";

const signin = () => {
  const router = useRouter();
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  console.log("data", data);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    console.log("data", data);
  };

  const handleSubmit = async () => {
    const isValid = isValidData(data);
    if (isValid !== "") {
      alert(isValid);
      return;
    }
    try {
      const response = await performLogin(data);
     
      if (response) {
        console.log("response", response);
        // router.push("/");
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      alert(
        "Error signing up" +
          JSON.stringify(error.response.data.non_field_errors[0]),
      );
    }
  };

  const isValidData = (dataInstance: any) => {
    if (dataInstance.username === "" || dataInstance.password === "") {
      return "Please enter both username and password";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-40">
      <div className="flex w-1/2 flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Lets Get Started !</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={() => handleSubmit()}
            >
              <label
                htmlFor="include"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Username
              </label>
              <Input
                placeholder="Your username"
                required
                name="username"
                onChange={(e: any) => handleChange(e)}
              />

              <label
                htmlFor="include"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <Input
                placeholder="Your password"
                required
                name="password"
                type="password"
                onChange={(e: any) => handleChange(e)}
              />
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex gap-4 flex-col  items-start">
            <Button type="submit" onClick={() => handleSubmit()}>
              Sign In
            </Button>
            <div className="flex gap-4 self-start">
              Already a beta user ?
              <a href="/signup" className="text-blue-500">
                Sign Up
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default signin;
