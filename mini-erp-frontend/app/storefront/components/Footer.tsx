import React from "react";
import Link from "next/link";
import { useStoreSettings } from "../StoreSettingsContext";

const Footer = () => {
  const { settings } = useStoreSettings();
  
  return (
    <footer className="bg-sf-surface-container-low dark:bg-sf-inverse-surface w-full mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5 md:px-16 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logoUrl && settings.logoUrl !== "storefront" && (
                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-cover rounded-sm" />
              )}
              <span className="font-sf-display text-4xl text-sf-primary block font-extrabold">
                {settings?.storeName || "Grocer"}
              </span>
            </div>
            <p className="text-sf-secondary dark:text-sf-secondary-fixed font-sf-body text-base max-w-sm mb-2">
              {settings?.slogan || "Authentic, transparent, and sophisticated."}
            </p>
            {settings && (
              <div className="text-sm text-sf-on-surface-variant flex flex-col gap-1 mt-4">
                <p>📍 {settings.address}</p>
                <p>📞 {settings.phone}</p>
                <p>✉️ {settings.email}</p>
              </div>
            )}
          </div>
          <div className="mt-8 md:mt-auto">
            <p className="text-sf-on-surface-variant text-sm">© {new Date().getFullYear()} {settings?.storeName || "Grocer"}. All rights reserved.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:justify-items-end">
          <div className="flex flex-col gap-4 font-sf-body text-base">
            <h4 className="font-bold text-sf-on-surface mb-2">Company</h4>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">About Us</Link>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">Careers</Link>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">Journal</Link>
          </div>
          <div className="flex flex-col gap-4 font-sf-body text-base">
            <h4 className="font-bold text-sf-on-surface mb-2">Support</h4>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">Contact Us</Link>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">Shipping Terms</Link>
            <Link className="text-sf-on-surface-variant hover:text-sf-primary hover:underline decoration-sf-secondary underline-offset-4 transition-all duration-300 ease-in-out" href="#">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
