import { decryptMessage } from './encryption';

// Function to handle the initial hash when the page loads
export function handleInitialHash() {
    const hash = window.location.hash;
    switch (hash) {
        case '#allContracts':
            displayAllContracts();
            break;
        case '#myFiles':
            displayMyFiles();
            break;
        default:
            // No default action, or you can add a default view if necessary
            break;
    }
}

// Function to fetch Hive balance
export function fetchHiveBalance(username) {
    const apiUrl = 'https://api.hive.blog';
    const requestBody = {
        jsonrpc: '2.0',
        method: 'condenser_api.get_accounts',
        params: [[username]],
        id: 1
    };

    fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.result && data.result.length > 0) {
                const balance = data.result[0].balance;
                document.getElementById('balance').innerText = balance;
            } else {
                document.getElementById('balance').innerText = '';
            }
        })
        .catch(error => {
            console.error('Error fetching Hive balance:', error);
            document.getElementById('balance').innerText = '';
        });
}

// Function to display the image in a modal
function displayImageModal(imageSrc) {
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal';
        modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <img class="modal-image" src="">
      </div>
    `;
        document.body.appendChild(modal);

        const span = modal.getElementsByClassName("close")[0];
        span.onclick = function () {
            modal.style.display = "none";
        }
    }

    const modalImg = modal.getElementsByClassName('modal-image')[0];
    modalImg.src = imageSrc;
    modal.style.display = "block";
}

let decryptionQueue = [];
let isDecrypting = false;

function processDecryptionQueue() {
    if (decryptionQueue.length === 0) {
        isDecrypting = false;
        return;
    }

    isDecrypting = true;
    const { username, encryptedMessage, callback } = decryptionQueue.shift();
    decryptMessage(username, encryptedMessage, (error, decryptedMessage) => {
        callback(error, decryptedMessage);
        processDecryptionQueue();
    });
}

export function updateMyFiles() {
    const username = localStorage.getItem('hive_username');
    const spkApiUrl = `https://spktest.dlux.io/@${username}`;

    fetch(spkApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.broca) {
                const brocaBalance = data.broca.split(',')[0];
                document.getElementById('balance').innerText = `Broca: ${brocaBalance}`;
                document.getElementById('brocaBalance').innerText = `${brocaBalance} BROCA`;
            }
            if (data.spk_power) {
                const spkPowerBalance = data.spk_power;
                document.getElementById('spkPowerBalance').innerText = `${spkPowerBalance} SPK Power`;
            }
            if (data.spk) {
                const spkBalance = data.spk;
                document.getElementById('spkBalance').innerText = `${spkBalance} SPK`;
            }
            updateImagePlaceholders(data.file_contracts);
        })
        .catch(error => {
            console.error('Error fetching data from SPK API:', error);
        });
}

// Function to determine file type from raw content
function getFileType(buffer) {
    const view = new DataView(buffer);

    if (view.getUint32(0, false) === 0x89504E47) {
        return 'image/png';
    } else if (view.getUint16(0, false) === 0xFFD8) {
        return 'image/jpeg';
    } else if (view.getUint32(0, false) === 0x47494638 || view.getUint32(0, false) === 0x47494639) {
        return 'image/gif';
    } else if (view.getUint32(0, false) === 0x52494646) {
        return 'image/webp';
    } else if (view.getUint32(0, false) === 0x25504446) {
        return 'application/pdf';
    } else if (view.getUint32(0, false) === 0x504B0304) {
        return 'application/zip';
    } else if (view.getUint32(0, false) === 0x494433 || (view.getUint16(0, false) === 0xFFFB || view.getUint16(0, false) === 0xFFF3)) {
        return 'audio/mpeg';
    } else if (view.getUint32(0, false) === 0x4F676753) {
        return 'audio/ogg';
    } else if (view.getUint32(0, false) === 0x664C6143) {
        return 'audio/flac';
    } else if ((view.getUint32(0, false) === 0x52494646) && (view.getUint32(8, false) === 0x57415645)) {
        return 'audio/wav';
    } else if (view.getUint16(0, false) === 0x1F8B) {
        return 'application/gzip';
    } else if (view.getUint32(0, false) === 0x4D546864) {
        return 'audio/midi';
    } else if (view.getUint32(4, false) === 0x66747970) {
        return 'video/mp4';
    } else if (view.getUint32(0, false) === 0x464C5601) {
        return 'video/x-flv';
    } else if (view.getUint32(0, false) === 0x4F676753 && view.getUint32(28, false) === 0x76696465) {
        return 'video/ogg';
    } else {
        return 'application/octet-stream';
    }
}

export const updateImagePlaceholders = async (fileContracts) => {
    const imageGrid = document.querySelector('.image-grid');
    imageGrid.innerHTML = '';

    for (const contractId in fileContracts) {
        const contract = fileContracts[contractId];
        if (contract.df) {
            for (const ipfsHash in contract.df) {
                const fileSize = contract.df[ipfsHash];
                const imageUrl = `https://ipfs.dlux.io/ipfs/${ipfsHash}`;
                const imageElement = document.createElement('div');
                imageElement.classList.add('image-placeholder');
                imageElement.innerHTML = `
          <label class="image-checkbox-label">
            <input type="checkbox" class="image-checkbox">
            <span class="image-checkbox-custom"></span>
          </label>
          <img src="" class="image-thumbnail" />
          <div class="image-title">${contractId}</div>
          <button class="add-button">+</button>
        `;
                imageElement.dataset.contractId = contract.i;
                imageElement.dataset.fileSize = fileSize;

                fetch(`https://ipfs.dlux.io/ipfs/${ipfsHash}`)
                    .then(response => response.text())
                    .then(fileContent => {
                        if (fileContent.startsWith('encrypted:')) {
                            let fileType = fileContent.slice(10, fileContent.indexOf('#'));
                            let removedMetadata = fileContent.slice(fileContent.indexOf('#') + 1);
                            let parts = removedMetadata.split('#');
                            let hashCount = (fileContent.match(/#/g) || []).length;
                            let encryptedKey = parts[1];
                            let encryptedMessage = parts[2];
                            let encryptedMessageWithKey = '#' + encryptedKey + '#' + encryptedMessage;
                            let fileName = hashCount === 4 ? parts[3] : null;
                            decryptionQueue.push({
                                username: localStorage.getItem('hive_username'),
                                encryptedMessage: encryptedMessageWithKey,
                                callback: (error, decryptedMessage) => {
                                    if (error) {
                                        console.error('Error decrypting message:', error);
                                    } else {
                                        const imageThumbnail = imageElement.querySelector('.image-thumbnail');
                                        const imageTitle = imageElement.querySelector('.image-title');
                                        if (fileType.startsWith('image/')) {
                                            const binaryString = window.atob(decryptedMessage);
                                            const len = binaryString.length;
                                            const bytes = new Uint8Array(len);

                                            for (let i = 0; i < len; i++) {
                                                bytes[i] = binaryString.charCodeAt(i);
                                            }

                                            const imageBlob = new Blob([bytes], { type: fileType });

                                            imageThumbnail.src = URL.createObjectURL(imageBlob);
                                            imageThumbnail.addEventListener('click', () => {
                                                const downloadLink = document.createElement('a');
                                                downloadLink.href = URL.createObjectURL(imageBlob);
                                                downloadLink.download = 'decrypted-image';
                                                downloadLink.click();
                                            });
                                        } else if (fileType.startsWith('video/')) {
                                            imageThumbnail.style.display = 'none';
                                            const videoElement = document.createElement('video');
                                            const binaryString = window.atob(decryptedMessage);
                                            const len = binaryString.length;
                                            const bytes = new Uint8Array(len);

                                            for (let i = 0; i < len; i++) {
                                                bytes[i] = binaryString.charCodeAt(i);
                                            }
                                            videoElement.src = URL.createObjectURL(new Blob([bytes], { type: fileType }));
                                            videoElement.controls = true;
                                            videoElement.style.width = '100%';
                                            videoElement.style.height = '100%';
                                            videoElement.style.objectFit = 'cover';
                                            imageThumbnail.parentNode.insertBefore(videoElement, imageThumbnail);
                                        } else {
                                            imageThumbnail.style.display = 'none';
                                            imageTitle.textContent = `${fileName || 'Unknown file Name'}`;
                                        }
                                    }
                                }
                            });

                            if (!isDecrypting) {
                                processDecryptionQueue();
                            }
                        } else {
                            fetch(`https://ipfs.dlux.io/ipfs/${ipfsHash}`)
                                .then(response => response.blob())
                                .then(blob => blob.arrayBuffer())
                                .then(arrayBuffer => {
                                    const fileType = getFileType(arrayBuffer);
                                    const imageThumbnail = imageElement.querySelector('.image-thumbnail');
                                    const imageTitle = imageElement.querySelector('.image-title');
                                    if (fileType.startsWith('image/')) {
                                        imageThumbnail.src = imageUrl;
                                    } else if (fileType.startsWith('video/mp4')) {
                                        imageThumbnail.style.display = 'none';
                                        const videoElement = document.createElement('video');
                                        videoElement.src = imageUrl;
                                        videoElement.controls = true;
                                        videoElement.style.width = '100%';
                                        videoElement.style.height = '100%';
                                        videoElement.style.objectFit = 'cover';
                                        imageThumbnail.parentNode.insertBefore(videoElement, imageThumbnail);
                                    } else {
                                        imageThumbnail.style.display = 'none';
                                        imageTitle.textContent = `File type: ${fileType}`;
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching file content from IPFS:', error);
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching file content from IPFS:', error);
                    });

                addImageEventListeners(imageElement, imageUrl, contract);
                imageGrid.appendChild(imageElement);
            }
        }
    }
    updateCheckboxEventListeners();
}

// Function to add event listeners for image and button interactions
function addImageEventListeners(imageElement, imageUrl, contract) {
    imageElement.querySelector('.image-thumbnail').addEventListener('click', function () {
        displayImageModal(imageUrl);
    });

    imageElement.querySelector('.add-button').addEventListener('click', function (event) {
        event.stopPropagation();
        populateStorageNodes(contract.n);
        document.getElementById('extendStoreModal').style.display = 'block';
        document.getElementById('extendStoreModal').dataset.contractId = contract.i;
    });
}

// Function to populate storage nodes in the modal
function populateStorageNodes(storageNodes) {
    const storageNodesList = document.getElementById('storageNodesList');
    storageNodesList.innerHTML = '';
    Object.values(storageNodes).forEach(function (node) {
        const listItem = document.createElement('li');
        listItem.textContent = node;
        storageNodesList.appendChild(listItem);
    });
}

export const toggleSelectAllCheckboxes = () => {
    const checkboxes = document.querySelectorAll('.image-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
    toggleStoreFilesButtonVisibility();
};

export const toggleStoreFilesButtonVisibility = () => {
    const anyCheckboxSelected = Array.from(document.querySelectorAll('.image-checkbox')).some(checkbox => checkbox.checked);
    document.getElementById('storeFilesButton').style.display = anyCheckboxSelected ? 'inline-block' : 'none';
};

function updateCheckboxEventListeners() {
    document.querySelectorAll('.image-checkbox').forEach(function (checkbox) {
        checkbox.addEventListener('change', toggleStoreFilesButtonVisibility);
    });
}

export const openExtendDurationModal = () => {
    var extendModal = document.getElementById('extendDurationModal');
    if (extendModal) {
        extendModal.style.display = 'block';
    } else {
        console.error('Extend Duration Modal not found');
    }
};

export const calculateExtendCost = (fileSize) => {
    const durationSelect = document.getElementById('extendDurationSelect');
    const duration = durationSelect.value;
    const costPer1024Bytes = 10;
    const cost = Math.ceil(fileSize / 1024) * costPer1024Bytes * duration;
    document.getElementById('extendCost').innerText = `Cost: ${cost} BROCA`;
    document.getElementById('extendDurationForm').setAttribute('data-duration', duration);
    document.getElementById('extendDurationForm').setAttribute('data-cost', cost);
};
// Function to display all contracts
export const displayAllContracts = () => {
    fetch('https://spktest.dlux.io/feed')
        .then(response => response.json())
        .then(data => {
            const feed = data.feed;
            const filterToggle = document.getElementById('filterContractsToggle');
            const filterContracts = filterToggle ? filterToggle.checked : false;
            const filteredFeed = Object.entries(feed);
            const usernames = filteredFeed.map(([_, entry]) => {
                const match = entry.match(/@(\w+)/);
                return match ? match[1] : null;
            }).filter(Boolean);

            const uniqueUsernames = [...new Set(usernames)];
            const userPromises = uniqueUsernames.map(username => {
                return fetch(`https://spktest.dlux.io/@${username}`)
                    .then(response => response.json())
                    .then(userData => {
                        const fileContracts = userData.file_contracts || {};
                        const filteredContracts = {};
                        for (const contractId in fileContracts) {
                            const contract = fileContracts[contractId];
                            if (filterContracts && Object.keys(contract.n).length < 3) {
                                filteredContracts[contractId] = contract;
                            } else if (!filterContracts) {
                                filteredContracts[contractId] = contract;
                            }
                        }
                        return filteredContracts;
                    })
                    .catch(error => {
                        console.error(`Error fetching contracts for user ${username}:`, error);
                        return {};
                    });
            });

            Promise.all(userPromises).then(allContracts => {
                const combinedContracts = Object.assign({}, ...allContracts);
                updateImagePlaceholders(combinedContracts);
            });
            document.querySelector('.image-grid').style.display = 'grid';
            document.getElementById('walletContent').style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching feed:', error);
        });
}
// Function to display the user's files
export const displayMyFiles = () => {
    const username = localStorage.getItem('hive_username');
    if (username) {
        updateMyFiles();
        document.querySelector('.image-grid').style.display = 'grid';
        document.getElementById('walletContent').style.display = 'none';
    } else {
        window.location.hash = '#login';
    }
}
