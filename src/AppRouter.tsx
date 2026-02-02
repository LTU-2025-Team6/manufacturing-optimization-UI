import { createBrowserRouter } from "react-router-dom";
import ProviderListPage from "./pages/ProviderListPage/ProviderListPage";
import RequestOptimizationPage from "./pages/RequestOptimizationPage/RequestOptimizationPage";
import PlanPage from "./pages/PlanPage/PlanPage";
import HomePage from "./pages/HomePage/HomePage";
import App from "./App";

export const AppRouter = createBrowserRouter([
    {
        id: 'app',
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'providers',
                element: <ProviderListPage /> },
            {
                path: 'optimization-request',
                element: <RequestOptimizationPage />
            },
            {
                path: 'plan/:requestId',
                element: <PlanPage />
            },
        ],
    }
]);

export default AppRouter;
