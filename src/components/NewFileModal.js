import React, { useState, useEffect, useRef } from 'react';
import { handleFiles } from '../utils/fileUpload';
import { fetchServiceProviders, fetchChannels, createContract } from '../utils/contracts';

const NewFileModal = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [encrypt, setEncrypt] = useState(false);
    const [multiEncrypt, setMultiEncrypt] = useState(false);
    const [accounts, setAccounts] = useState('');
    const [contractCost, setContractCost] = useState(0);
    const modalRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        calculateContractCost(file);
    };

    const handleEncryptChange = () => {
        setEncrypt(!encrypt);
    };

    const handleMultiEncryptChange = () => {
        setMultiEncrypt(!multiEncrypt);
    };

    const handleAccountsChange = (event) => {
        setAccounts(event.target.value);
    };

    const handleCreateContract = () => {
        const username = localStorage.getItem('hive_username');
        const serviceProvider = document.getElementById('serviceProvider').value;
        createContract(username, serviceProvider, contractCost, false);
    };

    const handleCreateFreeContract = () => {
        const username = localStorage.getItem('hive_username');
        const serviceProvider = document.getElementById('serviceProvider').value;
        createContract(username, serviceProvider, contractCost, true);
    };

    const handleUpload = () => {
        const formElement = document.getElementById('newFileForm');
        const selectedChannel = formElement ? formElement.getAttribute('data-selected-channel') : null;
        console.log('Selected channel:', selectedChannel);
        if (selectedFile && selectedChannel) {
            const accountsList = accounts.split(',').map((account) => account.trim());
            handleFiles([selectedFile], encrypt, multiEncrypt, accountsList);
        } else if (!selectedFile) {
            alert('Please select a file to upload.');
        } else if (!selectedChannel){
            alert('Please select a channel to upload the file.');
        }
    };

    const calculateContractCost = (file) => {
        if (file) {
            const fileSize = file.size;
            const costPer1024Bytes = 10; // Adjust this value as per your requirements
            const cost = Math.ceil(fileSize / 1024) * costPer1024Bytes;
            setContractCost(cost);
        } else {
            setContractCost(0);
        }
    };

    const handleTabClick = (step) => {
        setCurrentStep(step);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="modal-step">
                        <h3>Step 1: Select File</h3>
                        <div id="fileDropArea" className="drop-area">
                            <input
                                type="file"
                                id="fileUpload"
                                name="fileUpload"
                                required
                                onChange={handleFileChange}
                            />
                            {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                        </div>
                        <div>
                            <input type="checkbox" id="encryptCheckbox" name="encryptCheckbox" checked={encrypt} onChange={handleEncryptChange} />
                            <label htmlFor="encryptCheckbox">Encrypt File</label>
                        </div>
                        <div>
                            <input type="checkbox" id="multiEncryptCheckbox" name="multiEncryptCheckbox" checked={multiEncrypt} onChange={handleMultiEncryptChange} />
                            <label htmlFor="multiEncryptCheckbox">Encrypt to Multiple Accounts</label>
                        </div>
                        {multiEncrypt && (
                            <div id="multiEncryptForm">
                                <label htmlFor="accounts">Enter accounts (comma separated):</label>
                                <input type="text" id="accounts" name="accounts" value={accounts} onChange={handleAccountsChange} />
                            </div>
                        )}
                        {contractCost > 0 && (
                            <p>Cost to store for 30 days: {contractCost} BROCA</p>
                        )}
                        <button type="button" onClick={() => handleTabClick(2)} style={{ marginTop: '20px' }}>Next</button>
                    </div>
                );
            case 2:
                return (
                    <div className="modal-step">
                        <h3>Step 2: Create Contract</h3>
                        <label htmlFor="serviceProvider">Select Service Provider:</label>
                        <select id="serviceProvider" name="serviceProvider"></select>
                        <div id="statusBar" style={{ display: 'none' }}>Status: <span id="statusMessage">Waiting...</span></div>
                        <div>
                            <label>Channels:</label>
                            <ul id="channelsList"></ul>
                        </div>
                        <button type="button" onClick={handleCreateContract}>Create Contract</button>
                        <button type="button" onClick={handleCreateFreeContract}>Free Contract</button>
                        <button type="button" onClick={() => handleTabClick(3)}>Next</button>
                    </div>
                );
            case 3:
                return (
                    <div className="modal-step">
                        <h3>Step 3: Upload File</h3>
                        <div id="uploadStatusContainer" className="upload-status-container"></div>
                        <button type="button" onClick={handleUpload}>Upload File</button>
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        const handleNewButtonClick = () => {
            if (modalRef.current) {
                modalRef.current.style.display = 'block';
            }
        };

        const newButton = document.getElementById('newButton');
        if (newButton) {
            newButton.addEventListener('click', handleNewButtonClick);
        }

        return () => {
            if (newButton) {
                newButton.removeEventListener('click', handleNewButtonClick);
            }
        };
    }, []);

    useEffect(() => {
        if (currentStep === 2) {
            fetchServiceProviders();
            fetchChannels();
        }
    }, [currentStep]);

    return (
        <div ref={modalRef} id="newFileModal" className="modal">
            <div className="modal-content">
                <span className="close">&times;</span>
                <div className="modal-steps-header">
                    <div
                        className={`modal-step-tab ${currentStep === 1 ? 'active' : ''}`}
                        onClick={() => handleTabClick(1)}
                    >
                        Step 1: Select File
                    </div>
                    <div
                        className={`modal-step-tab ${currentStep === 2 ? 'active' : ''}`}
                        onClick={() => handleTabClick(2)}
                    >
                        Step 2: Create Contract
                    </div>
                    <div
                        className={`modal-step-tab ${currentStep === 3 ? 'active' : ''}`}
                        onClick={() => handleTabClick(3)}
                    >
                        Step 3: Upload File
                    </div>
                </div>
                <form id="newFileForm">
                    {renderStepContent()}
                </form>
            </div>
        </div>
    );
};

export default NewFileModal;
