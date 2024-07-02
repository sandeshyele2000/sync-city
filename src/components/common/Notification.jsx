import React from "react";
import {Toaster} from 'react-hot-toast'

function Notification() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: "",
        duration: 5000,
        style: {
          background: "#000",
          color: "#878787",
        },

        success: {
          duration: 5000,
          theme: {
            primary: "green",
            secondary: "black",
          },
        },
      }}
    />
  );
}

export default Notification;
