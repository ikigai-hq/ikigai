import React from "react";
import Link from "next/link";

export type LogoProps = {
  src: string;
};

const Logo = ({ src }: LogoProps) => {
  return (
    <Link href="https://tikigai.org" target="_blank">
      <img
        alt="logo"
        src={src}
        style={{
          objectFit: "contain",
          height: 40,
        }}
      />
    </Link>
  );
};

export default Logo;
