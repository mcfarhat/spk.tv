import React from 'react';

function PowerUpModal() {
    return (
        <div id="powerUpModal" className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <h3>Power Up SPK</h3>
                <form id="powerUpForm">
                    <label htmlFor="powerUpAmount">Amount:</label>
                    <input type="number" id="powerUpAmount" name="powerUpAmount" required />
                    <p id="availableSPKBalance" className="clickable-balance">0 SPK</p>
                    <button type="submit" id="confirmPowerUpButton">Power Up</button>
                </form>
            </div>
        </div>
    );
}

export default PowerUpModal;
