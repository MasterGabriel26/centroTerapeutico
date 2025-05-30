
import React from "react";

export const Tabs = ({
  selectedIndex,
  onSelect,
  children,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) => {
  const childrenArray = React.Children.toArray(children);
  const tabList = childrenArray.find(
    (child: any) => child.type.displayName === "TabList"
  );
  const tabPanels = childrenArray.filter(
    (child: any) => child.type.displayName === "TabPanel"
  );

  return (
    <div>
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
}: {
  children: React.ReactNode[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <div className="flex border-b border-gray-300">
      {children.map((child, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            index === selectedIndex
              ? "border-b-2 border-[#2A93C9] text-[#2A93C9]"
              : "text-gray-500 hover:text-[#2A93C9]"
          }`}
        >
          {child}
        </button>
      ))}
    </div>
  );
};

TabList.displayName = "TabList";

export const Tab = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
Tab.displayName = "Tab";

export const TabPanel = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
TabPanel.displayName = "TabPanel";
=======
"use client"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b ${className}`}>
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

