"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "../shared/Logo";
import { UserMenu } from "../shared/layout/UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Gallery", href: "#gallery" },
    { name: "Roadmap", href: "#roadmap" },
    { name: "GitHub", href: "https://github.com/manish1803/pixel-art" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] h-16 border-b border-border-subtle bg-background/80 backdrop-blur-md flex items-center">
      <div className="content-container w-full flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Logo />
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <Link href="/auth/signin" className="text-xs font-bold text-text-muted hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/editor" className="btn-primary py-2 px-4 rounded-md">
                Launch Editor
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects" className="text-xs font-bold text-text-muted hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <UserMenu 
                onSignIn={() => router.push('/auth/signin')} 
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
