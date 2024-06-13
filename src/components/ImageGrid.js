import React, { useEffect } from 'react';
import { toggleSelectAllCheckboxes, openExtendDurationModal, calculateExtendCost, displayAllContracts, displayMyFiles } from '../utils/ui';
import { fetchChannels, fetchServiceProviders, storeSelectedFilesOnBlockchain } from '../utils/contracts';

const ImageGrid = () => {
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#allContracts') {
                displayAllContracts();
            } else if (hash === '#myFiles') {
                console.log('Displaying my files');
                displayMyFiles();
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    useEffect(() => {
        document.getElementById('selectAllButton').addEventListener('click', toggleSelectAllCheckboxes);
        document.getElementById('storeFilesButton').addEventListener('click', storeSelectedFilesOnBlockchain);
        document.getElementById('extendButton').addEventListener('click', openExtendDurationModal);
        document.getElementById('extendButton').addEventListener('click', () => {
            const extendModal = document.getElementById('extendStoreModal');
            const contractId = extendModal.dataset.contractId;
            const imageElement = document.querySelector(`.image-placeholder[data-contract-id="${contractId}"]`);
            const fileSize = imageElement ? parseInt(imageElement.dataset.fileSize, 10) : 0;
            calculateExtendCost(fileSize);
        });
        document.getElementById('extendDurationSelect').addEventListener('change', () => {
            const extendModal = document.getElementById('extendStoreModal');
            const contractId = extendModal.dataset.contractId;
            const imageElement = document.querySelector(`.image-placeholder[data-contract-id="${contractId}"]`);
            const fileSize = imageElement ? parseInt(imageElement.dataset.fileSize, 10) : 0;
            calculateExtendCost(fileSize);
        });
        document.getElementById('filterContractsToggle').addEventListener('change', displayAllContracts);

        fetchChannels();
        fetchServiceProviders();
    }, []);

    const openImageModal = (imageUrl) => {
        const imageModal = document.getElementById('imageModal');
        const imageModalContent = document.getElementById('imageModalContent');
        imageModalContent.src = imageUrl;
        imageModal.style.display = 'block';
    };

    return (
        <>
            <div className="filter-toggle">
                <label>
                    <input type="checkbox" id="filterContractsToggle" /> Show contracts with less than 3 storage nodes
                </label>
                <button id="selectAllButton">Select All</button>
                <button id="storeFilesButton" style={{ display: 'none' }}>Store Files</button>
            </div>
            <div className="image-grid" onClick={(event) => {
                if (event.target.className === 'image-thumbnail') {
                    openImageModal(event.target.src);
                }
            }}>
                {/* Images will be added here */}
            </div>
        </>
    );
};

export default ImageGrid;
