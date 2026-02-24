import { type ReactElement, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import NotificationHub from '../NotificationHub/NotificationHub';

const Layout = (): ReactElement => {
    const [isHubCollapsed, setIsHubCollapsed] = useState(false);
    const location = useLocation();
    const isNotificationsPage = location.pathname === '/notifications';

    return (
        <div className={`app-container ${isHubCollapsed ? 'hub-collapsed' : 'hub-expanded'} ${isNotificationsPage ? 'hide-hub' : ''}`}>
            <div className="main-workspace">
                <header>
                    <a className='branding' href="/">
                        <MaterialIcon className="text-gradient" icon="factory" size="XL" />
                        <h1 className="text-gradient">ManufacturingEngine</h1>
                    </a>
                    
                    <nav>
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/plans">Plans</NavLink>
                        <NavLink to="/providers">Registered providers</NavLink>
                        <NavLink to="/optimization-request">Request optimization</NavLink>
                        <NavLink to="/notifications">Notifications</NavLink>
                    </nav>
                </header>

                <main>
                    <Outlet />
                </main>

                <footer>
                    <p>&copy; 2026 Manufacturing Engine App</p>
                </footer>
            </div>

            {!isNotificationsPage && (
                <div className="notification-sidebar">
                    <NotificationHub 
                        isCollapsed={isHubCollapsed}
                        onToggleCollapse={setIsHubCollapsed}
                    />
                </div>
            )}
        </div>
    );
};

export default Layout;
