"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import { useCustomerAuth } from "../CustomerAuthContext";

const Header = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, customerName, logout } = useCustomerAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-sf-surface/80 backdrop-blur-md dark:bg-sf-inverse-surface/80">
      <div className="flex justify-between items-center px-5 md:px-16 py-4 w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link className="flex items-center gap-2" href="/storefront">
          <img 
            alt="Grocer Brand Logo" 
            className="h-10 w-10 object-cover rounded-sm" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLvS7_c1BgyyRakHSGtUKsvTnpCc7cag5hF0q1npCRpis2d9sG4b2vaBuwmzGdJnyDC1vqBdgfQtrVWJz-cnp8UES_YPbzUbAkzx6kGPPjA1Ta4cJQWMEMVub9FZbRPhKxsYYJ736drK6ttMsb7oVD-DwnaA6AQ5Ss-Owx86qvXduBR3zLm9RIZh6zDThGVVwzqhNlf4lIp9FI5zrFSVacK96m4WhbZg3uaHvbgbPnfMX5b-f_A4V396fg" 
          />
          <span className="font-sf-display text-4xl font-extrabold text-sf-primary dark:text-sf-primary-fixed tracking-tight hidden md:block">
            Grocer
          </span>
        </Link>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-sf-outline">search</span>
            <input 
              className="w-full bg-sf-surface-container-low border-b border-sf-outline focus:border-sf-primary focus:ring-0 focus:outline-none pl-10 pr-4 py-2 text-sf-on-surface bg-transparent transition-colors" 
              placeholder="Search for fresh ingredients..." 
              type="text"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4 text-sf-primary dark:text-sf-primary-fixed font-sf-body text-base">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="font-sf-body text-sm font-semibold hidden md:block">
                Hi, {customerName}
              </span>
              <button 
                onClick={logout}
                className="hover:text-sf-primary transition-colors duration-200 group flex items-center justify-center p-2" 
                title="Đăng xuất"
              >
                <span className="material-symbols-outlined group-hover:fill">logout</span>
              </button>
            </div>
          ) : (
            <Link className="hover:text-sf-primary transition-colors duration-200 group flex items-center justify-center p-2" href="/storefront/auth/login" title="Đăng nhập">
              <span className="material-symbols-outlined group-hover:fill">person</span>
            </Link>
          )}
          <Link className="hover:text-sf-primary transition-colors duration-200 group relative flex items-center justify-center p-2" href="/storefront/cart">
            <span className="material-symbols-outlined group-hover:fill">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-sf-secondary text-sf-on-secondary font-sf-body font-semibold text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
