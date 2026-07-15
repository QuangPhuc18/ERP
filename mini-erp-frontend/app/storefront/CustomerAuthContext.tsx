"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface CustomerAuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  customerName: string | null;
  customerPhone: string | null;
  login: (token: string, name: string) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("customer_token");
    const name = localStorage.getItem("customer_name");
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check expiration
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setCustomerName(name || "Khách hàng");
          // ClaimTypes.NameIdentifier (http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier) usually holds the phone based on our backend
          const phoneClaim = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
          setCustomerPhone(phoneClaim || null);
        } else {
          // Token expired
          logout();
        }
      } catch (e) {
        logout();
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (token: string, name: string) => {
    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_name", name);
    setIsLoggedIn(true);
    setCustomerName(name);
    try {
      const decoded: any = jwtDecode(token);
      const phoneClaim = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      setCustomerPhone(phoneClaim || null);
    } catch (e) {
        // Ignore
    }
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    setIsLoggedIn(false);
    setCustomerName(null);
    setCustomerPhone(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ isLoggedIn, isInitialized, customerName, customerPhone, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
