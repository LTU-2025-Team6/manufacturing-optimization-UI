import { createBrowserRouter } from "react-router-dom";
import ProviderListPage from "./pages/ProviderListPage/ProviderListPage";
import ProviderDetailsPage from "./pages/ProviderDetailsPage/ProviderDetailsPage";
import RequestOptimizationPage from "./pages/RequestOptimizationPage/RequestOptimizationPage";
import PlanPage from "./pages/PlanPage/PlanPage";
import HomePage from "./pages/HomePage/HomePage";
import App from "./App";
import PlanListPage from "./pages/PlanListPage/PlanListPage";
import StrategyEditPage from "./pages/StrategyEditPage/StrategyEditPage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";

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
                element: <ProviderListPage />
            },
            {
                path: 'providers/:id',
                element: <ProviderDetailsPage />
            },
            {
                path: 'optimization-request',
                element: <RequestOptimizationPage />
            },
            {
                path: 'plans',
                element: <PlanListPage />
            },
            {
                path: 'plan/:requestId',
                element: <PlanPage />
            },
            {
                path: 'plan/:requestId/edit',
                element: <StrategyEditPage />
            },
            {
                path: 'notifications',
                element: <NotificationsPage />
            },
        ],
    }
]);

export default AppRouter;
