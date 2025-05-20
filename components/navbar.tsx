"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, User, LogOut, LogIn, Moon, Sun, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/locations", label: "Alanlar" },
    { href: "/scan", label: "QR Tara" },
    { href: "/dashboard", label: "Panelim", requireAuth: true },
  ]

  // Don't render user-specific content until mounted and auth is loaded
  if (!mounted) {
    return (
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled ? "glass-effect shadow-md" : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <QrCode className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold gradient-text">BoşMu?</span>
              </Link>
            </div>
            <div className="w-9 h-9"></div> {/* Placeholder for theme toggle */}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled ? "glass-effect shadow-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <QrCode className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">BoşMu?</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks
              .filter((link) => !link.requireAuth || (link.requireAuth && user))
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    pathname === link.href ? "text-primary-600 font-semibold" : "text-gray-700 dark:text-gray-300",
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Açık</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Koyu</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>Sistem</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!loading &&
              (user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 rounded-full">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">{user.fullName.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profilim</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" className="gradient-bg">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Giriş Yap
                  </Link>
                </Button>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-9 w-9">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass-effect border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks
                .filter((link) => !link.requireAuth || (link.requireAuth && user))
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary-600 p-2 rounded-md",
                      pathname === link.href
                        ? "text-primary-600 bg-primary-100 dark:bg-primary-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300",
                    )}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Açık Tema
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Koyu Tema
                  </>
                )}
              </Button>

              {!loading &&
                (user ? (
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </Button>
                ) : (
                  <Button asChild variant="default" size="sm" className="gradient-bg">
                    <Link href="/login" onClick={closeMenu}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Giriş Yap
                    </Link>
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
