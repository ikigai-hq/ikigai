import React from "react";

export type TabWrapperProps = {
  icon: React.ReactNode;
  text: React.ReactNode;
};

const TabPanelHeaderWrapper = ({ icon, text }: TabWrapperProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}
    >
      {icon}
      <span style={{ fontWeight: 500, fontSize: 16 }}>{text}</span>
    </div>
  );
};

export default TabPanelHeaderWrapper;
