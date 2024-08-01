import { Menu, Package2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header className={`flex flex-row justify-between items-center w-full text-xl p-12 font-semibold transition-all duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}  style={{ position: "sticky", top: 0, zIndex: 1000}}>
      <Link
        href="https://ai-interviewer.framer.website/"
        className="flex items-center gap-2"
        prefetch={false}
      >
        <div className="">AI Interviewer</div>
      </Link>
      <nav className="flex items-center gap-4 space-x-4">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:from-white dark:to-slate-900/10"
          prefetch={false}
        >
          Dashboard
        </Link>
        <Link
          href="/interview"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:from-white dark:to-slate-900/10"
          prefetch={false}
        >
          Interview
        </Link>
        <Link
          href="/settings"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:from-white dark:to-slate-900/10"
          prefetch={false}
        >
          Settings
        </Link>
        <Link
          href="/help"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-lg font-semibold  transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:from-white dark:to-slate-900/10"
          prefetch={false}
        >
          Help
        </Link>
      </nav>
    
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/interview"
              className="text-muted-foreground hover:text-foreground"
            >
              Interview
            </Link>
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
            <Link
              href="/help"
              className="text-muted-foreground hover:text-foreground"
            >
              Help
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-4 lg:gap-4">
        {isLoaded && (
          isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <UserButton afterSignOutUrl="/" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/help">Support</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOutButton>Logout</SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton mode="modal">
              <Button variant="secondary" size="icon" className="rounded-full">
                Sign In
              </Button>
            </SignInButton>
          )
        )}
      </div>
    </header>
  );
};

export default Navbar;