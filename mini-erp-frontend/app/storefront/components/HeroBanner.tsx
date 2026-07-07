"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import httpAxios from "../../services/httpAxios";

interface Banner {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
}

export default function HeroBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpAxios.get("/Storefront/banners/active")
      .then((res) => {
        setBanner(res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy Banner (Sử dụng Fallback cũ):", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
      return (
          <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 flex justify-center items-center min-h-[70vh]">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded mb-6"></div>
              </div>
          </section>
      );
  }

  // 🎯 LUÔN CÓ FALLBACK (GIỮ NGUYÊN GIAO DIỆN VÀ CODE CŨ NẾU KHÔNG CÓ DATA TỪ DB)
  const displayBanner = banner || {
    title: "Curated freshness, delivered daily.",
    subtitle: "Experience the season best produce, hand-selected for culinary enthusiasts. Authenticity in every bite.",
    buttonText: "Shop the Season",
    buttonLink: "#essentials",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuANM2a5DVdVMMGYD9AtGBRcW9tlYHIL3EsqFMwMsv0egU9eP37voXuYJT5JXjuygApgmUVyx0cT7fuLc0WKnWw9u6Elkb4c7Lv8s15CRbWedlzSK2cjDwAMJl3B6RZdPH37zI1U5XPGc770Z4g-650in60zuhkBH1kTGxQt3MUaoti87mFJOypbADAvxMDbncjYYk5lbj-JMWwi6RHjD8Lmv6PkGyPRvntubrb52ccQWfKGUsus0J8A",
  };

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[70vh]">
      <div className="lg:col-span-5 flex flex-col gap-6 z-10">
        <h1 className="font-sf-display text-5xl font-extrabold text-sf-on-surface leading-tight tracking-tight">
          {displayBanner.title}
        </h1>
        {displayBanner.subtitle && (
            <p className="font-sf-body text-lg text-sf-on-surface-variant max-w-md">
                {displayBanner.subtitle}
            </p>
        )}
        
        {displayBanner.buttonText && displayBanner.buttonLink && (
            <div className="mt-4">
                <Link 
                    href={displayBanner.buttonLink}
                    className="inline-flex items-center justify-center px-8 py-4 bg-sf-primary text-sf-on-primary hover:bg-sf-on-primary-fixed-variant transition-colors rounded font-sf-body text-xs font-semibold uppercase tracking-widest"
                >
                    {displayBanner.buttonText}
                </Link>
            </div>
        )}
      </div>
      <div className="lg:col-span-7 relative h-[50vh] lg:h-[80vh] w-full">
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat rounded-lg overflow-hidden transition-all duration-700 hover:scale-[1.01]" 
          style={{ backgroundImage: `url('${displayBanner.imageUrl}')` }}
        ></div>
      </div>
    </section>
  );
}
