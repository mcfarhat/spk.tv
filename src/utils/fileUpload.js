import IPFS from 'ipfs-only-hash';
import { encryptMessage } from './encryption';
import { pollForNewChannels } from './contracts';
import { updateMyFiles } from './ui';

export const handleFiles = async (files, encrypt, multiEncrypt, accounts) => {
    for (const file of files) {
        let ipfsHash;
        if (encrypt) {
            const fileContent = await convertToBase64(file);
            encryptMessage(localStorage.getItem('hive_username'), fileContent, async (err, encryptedMessage) => {
                if (err) {
                    alert('Encryption failed: ' + err);
                } else {
                    try {
                        encryptedMessage = 'encrypted:' + file.type + encryptedMessage + "#" + file.name;
                        const encryptedFile = new Blob([encryptedMessage], { type: file.type });
                        ipfsHash = await IPFS.of([new Uint8Array(await encryptedFile.arrayBuffer())]);
                        console.log('IPFS hash of encrypted file:', ipfsHash);
                        signAndUploadFile(encryptedFile, ipfsHash);
                    } catch (error) {
                        console.error('Error generating IPFS hash for encrypted file:', error);
                        alert('Error generating IPFS hash for encrypted file: ' + error);
                    }
                }
            });
        } else {
            ipfsHash = await IPFS.of([new Uint8Array(await file.arrayBuffer())]);
            console.log('IPFS hash of file:', ipfsHash);
            signAndUploadFile(file, ipfsHash);
        }
    }
};

const convertToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const signAndUploadFile = (file, ipfsHash) => {
    const username = localStorage.getItem('hive_username');
    const newFileForm = document.getElementById('newFileForm');
    const channelId = newFileForm ? newFileForm.getAttribute('data-selected-channel') : null;

    if (channelId) {
        const message = `${username}:${channelId},${ipfsHash}`;

        if (window.hive_keychain && typeof window.hive_keychain.requestSignBuffer === 'function') {
            window.hive_keychain.requestSignBuffer(
                username,
                message,
                'Posting',
                (response) => {
                    if (response.success && response.result) {
                        const signature = response.result;
                        initiateFileUploadWithProgress(file, username, channelId, ipfsHash, signature);
                    } else {
                        console.error('Error signing the message:', response.message);
                    }
                }
            );
        } else {
            alert('Hive Keychain is not installed or not loaded properly');
        }
    } else {
        console.error('No channel selected for file upload.');
        alert('Please select a channel to upload the file.');
    }
};

const initiateFileUploadWithProgress = (file, username, channelId, ipfsHash, signature) => {
    const uploadStatusBar = document.createElement('div');
    uploadStatusBar.id = 'uploadStatusBar';
    uploadStatusBar.classList.add('upload-status-bar');
    document.getElementById('uploadStatusContainer').appendChild(uploadStatusBar);

    const uploadProgress = document.createElement('div');
    uploadProgress.id = 'uploadProgress';
    uploadProgress.classList.add('upload-progress-bar');
    uploadStatusBar.appendChild(uploadProgress);

    const headersA = new Headers({
        'Content-Type': 'application/json',
        'X-Account': username,
        'X-Chain': "HIVE",
        'X-Cid': ipfsHash,
        'X-Contract': channelId,
        'X-Files': ',' + ipfsHash,
        'X-Sig': signature
    });

    const headersU = new Headers({
        'X-Account': username,
        'X-Cid': ipfsHash,
        'X-Contract': channelId,
        'X-Files': ',' + ipfsHash,
        'X-Sig': signature
    });

    fetch('https://ipfs.dlux.io/upload-authorize', {
        method: 'GET',
        headers: headersA
    })
        .then(response => response.json())
        .then(authData => {
            const formData = new FormData();
            formData.append('file', file);
            headersU.append('Content-Range', 'bytes=0-' + (file.size - 1) + '/' + file.size);
            return fetch('https://ipfs.dlux.io/upload', {
                method: 'POST',
                body: formData,
                headers: headersU
            }, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    uploadProgress.style.width = percentCompleted + '%';
                    uploadProgress.textContent = percentCompleted + '%';
                }
            });
        })
        .then(uploadData => {
            console.log('File uploaded successfully:', uploadData);
            uploadProgress.textContent = 'Upload complete!';
            setTimeout(() => {
                updateMyFiles();
            }, 5000);
        })
        .catch(error => {
            console.error('Error in file upload process:', error);
            uploadProgress.textContent = 'Upload failed';
        });
};
