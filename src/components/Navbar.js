import React from 'react';
import { logout } from '../utils/login';

const Navbar = () => {
    const openLoginModal = () => {
        document.getElementById('loginModal').style.display = 'block';
    };

    return (
        <nav>
            <div className="nav-left">
                <img src="spk.png" alt="Logo" id="navLogo" />
            </div>
            <div className="nav-right">
                <div id="balance"></div>
                <button id="loginButton" onClick={openLoginModal}>Login</button>
                <button id="logoutButton" onClick={logout} style={{ display: 'none' }}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
