// File: components/SOWAnalyzer/LoaderOverlay.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const LoaderOverlay = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
    <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
    <p className="text-lg text-gray-700 font-medium">{message}</p>
  </div>
);

export default LoaderOverlay;
