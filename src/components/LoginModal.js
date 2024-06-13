import React from 'react';
import { handleLoginFormSubmit } from '../utils/login';

const LoginModal = () => {
    const closeModal = () => {
        document.getElementById('loginModal').style.display = 'none';
    };

    return (
        <div id="loginModal" className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <form id="loginForm" onSubmit={handleLoginFormSubmit}>
                    <label htmlFor="username">Hive Username:</label>
                    <input type="text" id="username" name="username" required />
                    <button type="submit">Login with Hive Keychain</button>
                </form>
                <div id="loginStatus"></div>
            </div>
        </div>
    );
};

export default LoginModal;
