// src/features/pacientes/components/TabWithTooltip.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

interface TabWithTooltipProps {
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string; // Añadir esta prop
}

export const TabWithTooltip: React.FC<TabWithTooltipProps> = ({
  tooltip,
  isActive,
  onClick,
  icon: Icon,
  children,
  className = ""
}) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium border-b-2 transition-all duration-200 hover:bg-white/50
          ${isActive 
            ? "border-blue-500 text-blue-600 bg-white" 
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
          }
          ${className}
        `}
      >
        <Icon size={16} className="flex-shrink-0" />
        <span className="truncate">{children}</span>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 w-64 text-center">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};