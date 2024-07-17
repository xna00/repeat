import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login";
import MoblieApp from "../pages/MoblieApp";

export const mobileRouter = createBrowserRouter([
  {
    path: "/",
    element: <MoblieApp></MoblieApp>,
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
]);
