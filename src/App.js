import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NewFileModal from './components/NewFileModal';
import ExtendStoreModal from './components/ExtendStoreModal';
import ExtendDurationModal from './components/ExtendDurationModal';
import ImageGrid from './components/ImageGrid';
import WalletContent from './components/WalletContent';
import LoginModal from './components/LoginModal';
import PowerUpModal from './components/PowerUpModal';
import './styles.css';

function App() {
    return (
        <div className="main-container">
            <Navbar />
            <Sidebar />
            <div className="content-area">
                <ImageGrid />
                <WalletContent />
            </div>
            <NewFileModal />
            <ExtendStoreModal />
            <ExtendDurationModal />
            <LoginModal />
            <PowerUpModal />
        </div>
    );
}

export default App;
