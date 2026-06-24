import React from "react";

export const Icon = ({ d, size = 16, className = "" }: { d: string; size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

export const ISearch   = () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
export const IPlus     = () => <Icon d="M12 4v16m8-8H4" size={14} />;
export const IMinus    = () => <Icon d="M20 12H4" size={12} />;
export const IClose    = () => <Icon d="M6 18L18 6M6 6l12 12" size={12} />;
export const IBag      = () => <Icon d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" size={40} />;
export const ICheck    = () => <Icon d="M5 13l4 4L19 7" />;
export const IUser     = () => <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={14} />;
export const IChevron  = () => <Icon d="M19 9l-7 7-7-7" size={12} />;
export const ISpin     = () => (
  <svg className="animate-spin" width={16} height={16} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4}></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
