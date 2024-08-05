import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleUser, Menu, Package2, Search } from "lucide-react";
import { Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown-menu";
import "../styles/globals.css";

const PastInterviews = () => {
  // Mock data for demonstration
  const pastInterviews = [
    { id: '1722814610709', jobTitle: 'Software Engineer', date: '2024-03-15', time: '14:30' },
    { id: '2', jobTitle: 'Product Manager', date: '2024-03-10', time: '10:00' },
    // Add more mock data as needed
  ];

  return (
    <div className="min-h-screen bg-white bg-dot-pattern p-6">
      <div>
        <div className="flex items-center mb-8">
          <div className="text-xl absolute font-semibold text-gray-700">AI Interviewer</div>
          <h1 className="text-3xl font-bold text-black flex-grow text-center">Past Interviews</h1>
          <div className="flex items-center gap-4 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/help">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        </div>

        {pastInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastInterviews.map((interview) => (
              <Link href={`/${interview.id}/feedback`} key={interview.id}>
                <Card className="bg-white border border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-black mb-2">{interview.jobTitle}</h2>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{`${interview.date} at ${interview.time}`}</span>
                    </div>
                    <div className="flex justify-end">
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-white border border-gray-300 shadow-lg p-8 text-center">
            <Image
              src="/placeholder-logo.svg" // Replace with your actual logo path
              alt="Practice interviews"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-black mb-4">No interviews yet? No worries!</h2>
            <p className="text-gray-600 mb-6">Time to break the ice and practice those interview skills. Your future self will thank you!</p>
            <Button
              className="bg-black text-white border border-transparent hover:bg-white hover:text-black hover:border-black transition-all duration-300"
              onClick={() => {/* Add logic to start a practice interview */}}
            >
              Start a Practice Interview
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PastInterviews;