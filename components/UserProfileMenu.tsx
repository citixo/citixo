"use client"

import {
  ChevronDown,
//   Link,
  LogOut,
  Settings,
  Shield,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { memo, useState, useEffect } from "react";
// import { cookies } from "next/headers";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
const UserProfileMenu = ({
  user,
 
}: {
  user: any;
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

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
  
  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side httpOnly cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Show success toast
        toast.success("Successfully logged out!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Clear any remaining client-side cookies
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach((cookieName) => {
          Cookies.remove(cookieName);
        });
        
        // Redirect to home page
        window.location.href = "/";
      } else {
        console.error('Logout failed');
        // Show error toast
        toast.error("Logout failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Still try to clear client-side cookies and redirect
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach((cookieName) => {
          Cookies.remove(cookieName);
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Show error toast
      toast.error("Logout error. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Fallback: clear client-side cookies and redirect
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });
      window.location.href = "/";
    }
  };


  return (
    <div className="relative user-menu-container bg-slate-100">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center p-2 rounded-full  space-x-2 text-white ${
                          user?.isAdmin ? 'bg-gradient-to-r p-2 from-purple-500 to-purple-600' : 'bg-blue-500'
                    } font-medium transition-colors duration-200`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center text-white text-lg  `}>
                      {user ? user?.name?.split(' ')?.map((name:string)=>name.charAt(0))?.join('') : 'U'}
                    </div>
                   
                    {/* <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} /> */}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-slate-100 border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-black  ${
                            user?.isAdmin ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-blue-500'
                          }`}>
                            {user ? user?.name?.split(' ')?.map((name:string)=>name.charAt(0))?.join('') : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-black font-medium">{user?.name || 'User'}</p>
                              {user?.isAdmin && (
                                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full font-medium">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900 text-sm">{user?.email || 'user@example.com'}</p>
                            {user?.loginTime && (
                              <p className="text-gray-900 text-xs mt-1">
                                Logged in: {new Date(user.loginTime).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                        
                      {/* Menu Items */}
                      <div className="py-2 text-black">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:text-white hover:bg-[#374151] transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>My Profile</span>
                        </Link>
                        
                        {/* My Orders - Only show for regular users, not admins */}
                        {!user?.isAdmin && (
                          <Link
                            href="/orders"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:text-white hover:bg-[#374151] transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>My Orders</span>
                          </Link>
                        )}

                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:text-white hover:bg-[#374151] transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>

                        {/* Admin Panel Link - Only for Admin Users */}
                        {user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-[#374151] transition-colors duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield className="w-5 h-5" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <hr className="border-[#374151] my-2" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#374151] transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
  );
};

export default memo(UserProfileMenu);
