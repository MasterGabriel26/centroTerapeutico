import React from "react";

export const Tabs = ({
  selectedIndex,
  onSelect,
  children,
  className,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const childrenArray = React.Children.toArray(children);
  const tabList = childrenArray.find(
    (child: any) => child.type.displayName === "TabList"
  );
  const tabPanels = childrenArray.filter(
    (child: any) => child.type.displayName === "TabPanel"
  );

  return (
    <div className={className}>
      {tabList && React.cloneElement(tabList as React.ReactElement, {
        selectedIndex,
        onSelect
      })}
      {/* Aquí solo mostramos el panel activo */}
      <div className="mt-4">
        {tabPanels[selectedIndex]}
      </div>
    </div>
  );
};

export const TabList = ({
  children,
  selectedIndex,
  onSelect,
  className,
}: {
  children: React.ReactNode | React.ReactNode[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}) => {
  const baseStyles = "flex border-b border-gray-300 overflow-x-auto";
  const finalClassName = className ? `${baseStyles} ${className}` : baseStyles;

  return (
    <div className={finalClassName}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && onSelect) {
          return React.cloneElement(child, {
            onClick: () => onSelect(index),
            isSelected: index === selectedIndex,
            tabIndex: index,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

TabList.displayName = "TabList";

export const Tab = ({ 
  children, 
  className,
  onClick,
  isSelected,
  tabIndex,
}: { 
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  tabIndex?: number;
}) => {
  const defaultClassName = `px-4 py-2 text-sm font-medium transition-colors ${
    isSelected
      ? "border-b-2 border-[#2A93C9] text-[#2A93C9]"
      : "text-gray-500 hover:text-[#2A93C9]"
  }`;

  return (
    <button
      onClick={onClick}
      className={className || defaultClassName}
      type="button"
    >
      {children}
    </button>
  );
};

Tab.displayName = "Tab";

export const TabPanel = ({ 
  children,
  className,
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={className}>{children}</div>;
};

TabPanel.displayName = "TabPanel";