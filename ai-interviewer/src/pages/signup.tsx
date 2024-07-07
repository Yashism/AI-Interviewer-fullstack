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
import { performSignup, SignupData } from "@/lib/apiService";

const signup = () => {
  const [data, setData] = useState<SignupData>({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

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
      const response = await performSignup(data);
      console.log(response);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const isValidData = (dataInstance: any) => {
    if (
      dataInstance.username === "" ||
      dataInstance.password1 === "" ||
      dataInstance.password2 === "" ||
      dataInstance.email === ""
    ) {
      return "Please enter all fields";
    }
    if (dataInstance.password1 !== dataInstance.password2) {
      return "Passwords do not match";
    }

    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-40">
      <div className="flex w-1/2 flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Join our alpha program</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={() => handleSubmit()}
            >
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Username
              </label>

              <Input
                type="email"
                placeholder="Your username"
                required
                name="username"
                onChange={(e: any) => handleChange(e)}
              />
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <Input
                placeholder="Your Email"
                name="email"
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
                name="password1"
                type="password"
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
                name="password2"
                type="password"
                required
                onChange={(e: any) => handleChange(e)}
              />
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex flex-col  items-start gap-4">
            <Button onClick={() => handleSubmit()}>Sign Up</Button>
            <div className="flex gap-4 self-start">
              Already a beta user ?
              <a href="/signin" className="text-blue-500">
                Sign In
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default signup;
