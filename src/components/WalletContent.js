import React from 'react';

function WalletContent() {
    return (
        <div className="wallet-content" id="walletContent">
            <div className="spk-wallet-section">
                <div className="spk-wallet-header">
                    <h2>SPK Token <span className="test-badge">TEST</span></h2>
                    <p>The governance token for the SPK network.</p>
                </div>
                <div className="spk-wallet-balance">
                    <span id="spkBalance">0 SPK</span>
                </div>
                <button id="sendButton" className="spk-send-btn" aria-label="Send SPK Tokens">
                    <i className="fa fa-paper-plane"></i> Send
                </button>
                <button id="powerUpButton" className="spk-power-up-btn" aria-label="Power Up SPK Tokens">
                    <i className="fa fa-paper-plane"></i> Power Up
                </button>
            </div>
            <div className="spk-wallet-section">
                <div className="spk-wallet-header">
                    <h2>BROCA <span className="test-badge">TEST</span></h2>
                    <p>Resource Credits for the SPK network.</p>
                </div>
                <div className="spk-wallet-balance">
                    <span id="brocaBalance">0 BROCA</span>
                </div>
            </div>
            <div className="spk-wallet-section">
                <div className="spk-wallet-header">
                    <h2>SPK Power <span className="test-badge">TEST</span></h2>
                    <p>Powered SPK for Voting.</p>
                </div>
                <div className="spk-wallet-balance">
                    <span id="spkPowerBalance">0 SPK Power</span>
                </div>
            </div>
        </div>
    );
}

export default WalletContent;
