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
          background: "rgb(7, 7, 7)",
          color: "#7f0000f0f",
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
