import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/dashboard-layout";
import { UploadPage } from "./components/upload-page";
import { OverviewPage } from "./components/overview-page";
import { ChartsPage } from "./components/charts-page";
import { MapsPage } from "./components/maps-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: UploadPage },
      { path: "overview", Component: OverviewPage },
      { path: "charts", Component: ChartsPage },
      { path: "maps", Component: MapsPage },
    ],
  },
]);
