/* eslint-disable no-unused-vars */
"use client";
import React from "react";
import { createContext, useContext, useState } from "react";

interface ActiveLinkContextProps {
  activeLink: string;
  setActiveLink: (link: string) => void;
}

const ActiveLinkContext = createContext<ActiveLinkContextProps | undefined>(
  undefined
);

export function ActiveLinkProvider({ children }: { children: React.ReactNode }) {
  const [activeLink, setActiveLink] = useState("home");

  return (
    <ActiveLinkContext.Provider value={{ activeLink, setActiveLink }}>
      {children}
    </ActiveLinkContext.Provider>
  );
}

export function useActiveLink() {
  const context = useContext(ActiveLinkContext);
  if (!context) {
    throw new Error("useActiveLink must be used within ActiveLinkProvider");
  }
  return context;
}
