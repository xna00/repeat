import { createBrowserRouter } from "react-router-dom";

import App from "../pages/App";
import Login from "../pages/Login";

export const pcRouter = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
]);
