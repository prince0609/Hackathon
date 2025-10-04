import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import ReactDOM from "react-dom/client";
import {createBrowserRouter,RouterProvider,} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ManagerView from "./pages/ManagerView";
import EmployeeView from "./pages/EmployeeView";
import AddUser from "./pages/AddUser";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,  
  },
  {
    path: "/manager",
    element: <ManagerView />,  
  },
  {
    path: "/employee",
    element: <EmployeeView />,  
  },
  {
    path: "/dashboard",
    element: <AddUser />,  
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" reverseOrder={false} />
  </React.StrictMode>
);

