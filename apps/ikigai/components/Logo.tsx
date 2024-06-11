import React from "react";
import Link from "next/link";

export type LogoProps = {
  src: string;
};

const Logo = ({ src }: LogoProps) => {
  return (
    <Link href="https://ikigai.li" target="_blank" passHref>
      <img
        alt="logo"
        src={src}
        style={{
          objectFit: "contain",
          height: 40,
          cursor: "pointer",
        }}
      />
    </Link>
  );
};

export default Logo;
