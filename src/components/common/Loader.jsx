import React from "react";

function Loader({ size }) {
  return (
    <div className={`animate-spin absolute`} style={{ width: size, height: size }}>
      <img src="./logo.png" className="opacity-60" />
    </div>
  );
}

export default Loader;
