import Navbar from "@/components/navigation/Navbar";
import { useTheme } from "next-themes";
import "../styles/globals.css"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FaqElement } from "@/components/F&q";
import { ModeToggle } from "@/app/_components/toggle";

 export const help = () =>  { 
  const { theme } = useTheme();
  return  (
  <div className="flex flex-col gap-10">
    <Navbar />
    <div></div>
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>
            Fill out the form below to send us a message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <label
              htmlFor="include"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Your Name
            </label>
            <Input placeholder="Your Name" />
            <label
              htmlFor="include"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input placeholder="Your Email" type="enail" />
            <label
              htmlFor="include"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Message
            </label>
            <textarea placeholder="Your Message" className="resize-y p-2 border rounded-md h-32 focus:border-black dark:focus:border-black dark" />
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button className="w-32">Send</Button>
        </CardFooter>
      </Card>
      <div className="mt-8 mb-5 shadow-lg">
       <FaqElement/>
      </div>
    </div>
  </div>
);
}
export default help;