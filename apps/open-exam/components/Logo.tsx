import React from "react";

export type LogoProps = {
  src: string;
}

const Logo = ({ src }: LogoProps) => {
  return (
    <img
      alt="logo"
      src={src}
      style={{
        objectFit: "contain",
        height: 40,
      }}
    />
  );
};

export default Logo;
