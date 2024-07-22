import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login";
import MoblieApp from "../pages/MoblieApp";
import Redundancy from "../pages/Redundancy";

export const mobileRouter = createBrowserRouter([
  {
    path: "/",
    element: <MoblieApp></MoblieApp>,
  },
  {
    path: "/redundancy",
    element: <Redundancy></Redundancy>,
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
]);
