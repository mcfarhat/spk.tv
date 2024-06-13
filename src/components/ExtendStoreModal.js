import React from 'react';

function ExtendStoreModal() {
    return (
        <div id="extendStoreModal" className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <button id="extendButton">Extend</button>
                <button id="storeFileButton">Store File</button>
                <button id="deleteFileButton">Delete File</button>
                <div className="storage-nodes-section">
                    <h3>STORAGE NODES</h3>
                    <ul id="storageNodesList">
                        <li>Node Placeholder 1</li>
                        <li>Node Placeholder 2</li>
                        <li>Node Placeholder 3</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ExtendStoreModal;
