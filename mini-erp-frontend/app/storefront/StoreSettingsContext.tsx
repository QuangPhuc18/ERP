"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import SettingsService, { StoreSettingDTO } from "../services/SettingsService";

interface StoreSettingsContextType {
  settings: StoreSettingDTO | null;
  loading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: null,
  loading: true,
});

export const useStoreSettings = () => useContext(StoreSettingsContext);

export const StoreSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettingDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await SettingsService.getStoreSetting();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load store settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};
