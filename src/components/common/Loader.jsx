import React from "react";
import Image from 'next/image';

function Loader({ size }) {
  return (
    <div
      className={`animate-spin absolute`}
      style={{ width: size, height: size }}
    >
      <Image width={500} height={500} src="/logo.png" className="opacity-60 w-full h-full" />
    </div>
  );
}

export default Loader;
