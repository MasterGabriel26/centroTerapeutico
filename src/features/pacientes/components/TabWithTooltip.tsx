import React from 'react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { LucideIcon } from 'lucide-react';

interface TabWithTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}

export const TabWithTooltip: React.FC<TabWithTooltipProps> = ({
  children,
  tooltip,
  isActive,
  onClick,
  icon: Icon
}) => {
  return (
    <Tooltip content={tooltip}>
      <button
        onClick={onClick}
        className={`
          py-4 px-4 flex items-center gap-2 font-medium border-b-2 
          whitespace-nowrap transition-all duration-200 text-sm
          ${isActive
            ? "border-blue-600 text-blue-700"
            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }
        `}
      >
        {Icon && <Icon size={16} className="flex-shrink-0" />}
        <span>{children}</span>
      </button>
    </Tooltip>
  );
};