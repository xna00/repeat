/// <reference types="react/canary" />
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./global.css";
import { mobileRouter } from "./router/mobile";
import { pcRouter } from "./router/pc";

// navigator.serviceWorker
//   .register("/sw.js", {
//     type: "module",
//     scope: "/",
//   })
//   .then((s) => {});
navigator.serviceWorker.getRegistration().then((r) => r?.unregister());

const wide = window.innerWidth > 700;

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={wide ? pcRouter : mobileRouter} />
);
