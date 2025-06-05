"use client";

import React, { createContext, useContext, ReactNode } from "react";

export interface CompanySettings {
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  abn?: string;
  website?: string;
}

const defaultSettings: CompanySettings = {
  companyName: "MK AUTOTECK CENTRE",
  address: "109-113 McIntyre Rd, Sunshine North VIC 3020",
  phoneNumber: "(03) 9310 2776",
  email: "mkautoteckcentre@gmail.com",
  abn: "33 616 506 757",
};

const CompanySettingsContext = createContext<CompanySettings>(defaultSettings);

export const CompanySettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <CompanySettingsContext.Provider value={defaultSettings}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error(
      "useCompanySettings must be used within a CompanySettingsProvider"
    );
  }
  return context;
};
