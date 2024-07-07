import React from "react";
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

const Feedback = () => {
  return (
    <div>
      <Card x-chunk="dashboard-04-chunk-2">
        <CardHeader>
          <CardTitle>Submit us a feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <textarea
              placeholder="your message"
              cols={4}
              className="rounded-md border p-2 outline-0"
            />
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Feedback;
