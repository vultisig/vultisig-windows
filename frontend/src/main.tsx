import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "global";
import { Buffer } from "buffer";
import process from "process";

// Make sure Buffer is available globally
window.Buffer = Buffer;
window.process = process;

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
