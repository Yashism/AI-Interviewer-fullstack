import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { fetchUser, updateUserData } from "@/lib/apiService";

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
}

const GeneralSettings = () => {
  const [data, setData] = useState<UserData>({
    username: "",
    first_name: "",
    last_name: "",
  });
  const getUserData = async () => {
    const response = await fetchUser();
    if (!response) {
      console.error("Error fetching user data");
      return;
    }
    setData({
      username: response.username,
      first_name: response.first_name,
      last_name: response.last_name,
    });
  };
  useEffect(() => {
    getUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    console.log("data", data);
  };

  const handleSubmit = async () => {
    try {
      const response = await updateUserData(data);
      if (response) {
        console.log("User data updated successfully");
        alert("User data updated successfully");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="wrap flex flex-col gap-6">
              <Input
                name="username"
                onChange={handleChange}
                placeholder="username"
                defaultValue={data.username}
              />
              <Input
                name="first_name"
                onChange={handleChange}
                placeholder="First Name"
                defaultValue={data.first_name}
              />
              <Input
                name="last_name"
                onChange={handleChange}
                placeholder="Last Name"
                defaultValue={data.last_name}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSubmit}>Save</Button>
        </CardFooter>
      </Card>
      <Card x-chunk="dashboard-04-chunk-2">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <Input placeholder="Project Name" defaultValue="/content/plugins" />
            <div className="flex items-center space-x-2">
              <Checkbox id="include" defaultChecked />
              <label
                htmlFor="include"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Allow administrators to change the directory.
              </label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GeneralSettings;
