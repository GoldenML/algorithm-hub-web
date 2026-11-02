import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import Home from "@pages/Home";
import Sorting from "@pages/Sorting";
import GraphSearch from "@pages/GraphSearch";
import Greedy from "@pages/Greedy";
import DynamicProgramming from "@pages/DynamicProgramming";
import BinarySearch from "@pages/BinarySearch";
import NotFound from "@pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "sorting", element: <Sorting /> },
      { path: "graph-search", element: <GraphSearch /> },
      { path: "greedy", element: <Greedy /> },
      { path: "dynamic-programming", element: <DynamicProgramming /> },
      { path: "binary-search", element: <BinarySearch /> },
      { path: "404", element: <NotFound /> },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);

export default router;

export const HOME_PATHNAME = "/";
