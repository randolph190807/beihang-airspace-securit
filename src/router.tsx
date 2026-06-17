import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "@/App";
import { CommandLayout } from "@/layouts/command-layout";
import { DashboardPage } from "@/pages/dashboard";
import { OrderProcessingPage } from "@/pages/order-processing";
import { RealtimeSituationPage } from "@/pages/realtime-situation";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/realtime" replace />,
      },
      {
        element: <CommandLayout />,
        children: [
          {
            path: "realtime",
            element: <RealtimeSituationPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: "orders",
        element: <OrderProcessingPage />,
      },
    ],
  },
]);
