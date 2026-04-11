"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2200}
      hideProgressBar
      closeButton={false}
      pauseOnHover
      draggable={false}
      theme="light"
    />
  );
}
