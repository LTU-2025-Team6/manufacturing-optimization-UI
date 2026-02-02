import { type ReactElement } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

const Layout = (): ReactElement => {

    return (
        <div className="layout">
            <header>
                <a className='branding' href="/">
                    <MaterialIcon className="text-gradient" icon="factory" size="XL" />
                    <h1 className="text-gradient">ManufacturingEngine</h1>
                </a>
                
                <nav>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/providers">Registered providers</NavLink>
                    <NavLink to="/optimization-request">Request optimization</NavLink>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                <p>&copy; 2026 Manufacturing Engine App</p>
            </footer>
        </div>
    );
};

export default Layout;
