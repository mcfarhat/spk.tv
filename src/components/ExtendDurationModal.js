import React from 'react';

function ExtendDurationModal() {
    return (
        <div id="extendDurationModal" className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <h3>Extend Storage Duration</h3>
                <form id="extendDurationForm">
                    <label>Select duration:</label>
                    <select id="extendDurationSelect">
                        <option value="1">1 Day</option>
                        <option value="7">1 Week</option>
                        <option value="30">1 Month</option>
                        <option value="365">1 Year</option>
                    </select>
                    <p id="extendCost">Cost: </p>
                    <button type="button" id="extendContractButton">Extend Contract</button>
                </form>
            </div>
        </div>
    );
}

export default ExtendDurationModal;
