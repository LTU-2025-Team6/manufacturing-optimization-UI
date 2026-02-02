import './index.css'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import AppRouter from './AppRouter';

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={AppRouter} />
);