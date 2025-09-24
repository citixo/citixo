"use client";

import Link from "next/link";
import {
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import UserProfileNav from "./microcomponent/UserProfileNav";
import Brand from "./Brand";
import UserProfileMenu from "./UserProfileMenu";

interface UserData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin?: boolean;
}

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/check");
      const data = await response.json();
      if(data.success){
      setIsLoggedIn(true);
      setUser({
        email: data.email,
        name: data.name,
        loginTime: new Date().toISOString(),
        isAdmin: data.userType === "admin",
      });
    
    }
    else{
      setIsLoggedIn(false);
      setUser(null);
    }
    };
    checkAuth();
  }, []);

  // Listen for auth changes (e.g., logout from admin panel)
  useEffect(() => {
    const handleAuthChange = () => {
      // Re-check authentication when auth changes
      const checkAuth = async () => {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        if(data.success){
          setIsLoggedIn(true);
          setUser({
            email: data.email,
            name: data.name,
            loginTime: new Date().toISOString(),
            isAdmin: data.userType === "admin",
          });
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      };
      checkAuth();
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className=" mx-auto px-2">
          <div className="flex items-center justify-between h-16 font-sans font-black text-center text-black">
            {/* Logo */}
            <Brand />

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-gray-600 transition-colors duration-200 font-medium"
              >
                Home
              </Link>
              <Link
                href="/services"
                className="text-gray-900 hover:text-gray-600 transition-colors duration-200 font-medium"
              >
                Services
              </Link>
              <Link
                href="/plans"
                className="text-gray-900 hover:text-gray-600 transition-colors duration-200 font-medium"
              >
                Plans
              </Link>
              <Link
                href="/help"
                className="text-gray-900 hover:text-gray-600 transition-colors duration-200 font-medium"
              >
                Help
              </Link>
            </nav>

            {/* Right Section - Cart, Login & Profile */}
            <div className="flex items-center space-x-4">
              {/* Authentication Section */}
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="hidden md:block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Login
                </Link>
              ) : (
                <UserProfileMenu user={user} />
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-container md:hidden text-gray-900 hover:text-gray-600 p-2"
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {isMobileMenuOpen && (
                <div className="mobile-menu-container md:hidden absolute top-16 left-0 right-0 bg-white border-t border-white shadow-lg z-40">
                  <nav className="px-4 py-3 space-y-2">
                    <Link
                      href="/"
                      className="block text-gray-900 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/services"
                      className="block text-gray-900 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Services
                    </Link>
                    <Link
                      href="/plans"
                      className="block text-gray-900 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Plans
                    </Link>
                    <Link
                      href="/help"
                      className="block text-gray-900 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Help
                    </Link>
                    
                    {/* Mobile Login Button */}
                    {!isLoggedIn && (
                      <div className="pt-2 border-t border-[#374151]">
                        <Link
                          href="/login"
                          className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default memo(Header);
