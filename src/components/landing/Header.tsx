"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            potrzebny.ai
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#edukacja" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Edukacja
          </a>
          <a href="#zdrowie" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Zdrowie
          </a>
          <a href="#research" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Research
          </a>
          <a href="#cennik" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Cennik
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost">Zaloguj</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Rozpocznij za darmo</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)]">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="#edukacja" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Edukacja
            </a>
            <a href="#zdrowie" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Zdrowie
            </a>
            <a href="#research" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Research
            </a>
            <a href="#cennik" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Cennik
            </a>
            <div className="flex flex-col space-y-2 pt-4 border-t border-[var(--border)]">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">Zaloguj</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full">Rozpocznij za darmo</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
