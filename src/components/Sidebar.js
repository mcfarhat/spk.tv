// Sidebar.js
import React from 'react';

const Sidebar = () => {
    const handleNewButtonClick = () => {
        document.getElementById('newFileModal').style.display = 'block';
        // Additional logic for fetching service providers and channels can be added here
    };

    return (
        <div id="sidebar">
            <button id="newButton" onClick={handleNewButtonClick}>+ New</button>
            <a href="#myFiles">My Files</a>
            <a href="#allContracts">All Contracts</a>
            <a href="#wallet">Wallet</a>
        </div>
    );
};

export default Sidebar;

