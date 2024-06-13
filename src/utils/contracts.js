export const createContract = (username, serviceProvider, cost, isFreeContract) => {
    if (window.hive_keychain && typeof window.hive_keychain.requestBroadcast === 'function') {
        let operations;
        if (isFreeContract) {
            const customJson = JSON.stringify({
                "kb": cost
            });
            operations = [
                [
                    "custom_json",
                    {
                        "required_auths": [username],
                        "required_posting_auths": [],
                        "id": "SPK_TV_FREE_CONTRACT",
                        "json": customJson
                    }
                ]
            ];
        } else {
            operations = [
                [
                    "custom_json",
                    {
                        "required_auths": [username],
                        "required_posting_auths": [],
                        "id": "spkcc_channel_open",
                        "json": JSON.stringify({
                            "broca": cost,
                            "broker": serviceProvider,
                            "to": username,
                            "contract": "0"
                        })
                    }
                ]
            ];
        }
        window.hive_keychain.requestBroadcast(
            username,
            operations,
            'Active',
            function (response) {
                console.log('Broadcast transaction response:', response);
                if (response.success) {
                    const statusBar = document.getElementById('statusBar');
                    const statusMessage = document.getElementById('statusMessage');
                    statusBar.style.display = 'block';
                    statusMessage.textContent = 'Contract created. Looking for open channels...';
                    pollForNewChannels(username);
                } else {
                    alert('Failed to create contract: ' + response.message);
                }
            }
        );
    } else {
        alert('Hive Keychain is not installed');
    }
};
export const fetchChannels = () => {
    const username = localStorage.getItem('hive_username');
    if (username) {
        const apiUrl = `https://spktest.dlux.io/@${username}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const channels = data.channels;
                const channelsList = document.getElementById('channelsList');
                if (channelsList) {
                    channelsList.innerHTML = '';
                }
                const nextButton = document.getElementById('nextToStep3');
                if (nextButton) {
                    nextButton.style.display = 'none';
                }
                const createContractButton = document.getElementById('createContractButton');
                if (createContractButton) {
                    createContractButton.style.display = 'block';
                }
                for (const channelOwner in channels) {
                    for (const channelId in channels[channelOwner]) {
                        const channel = channels[channelOwner][channelId];
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.id = channel.i;
                        radio.name = 'channelSelection';
                        radio.value = channel.i;

                        const label = document.createElement('label');
                        label.htmlFor = channel.i;
                        label.appendChild(document.createTextNode(` ${channelOwner}/${channelId} (${channel.i})`));
                        const listItem = document.createElement('li');
                        listItem.appendChild(radio);
                        listItem.appendChild(label);

                        radio.addEventListener('change', function () {
                            const newFileForm = document.getElementById('newFileForm');
                            if (newFileForm) {
                                newFileForm.setAttribute('data-selected-channel', this.value);
                            }
                            if (nextButton) {
                                nextButton.style.display = 'block';
                            }
                            if (createContractButton) {
                                createContractButton.style.display = 'none';
                            }
                        });

                        if (channelsList) {
                            channelsList.appendChild(listItem);

                            if (channelsList.childElementCount === 1) {
                                radio.checked = true;
                                const newFileForm = document.getElementById('newFileForm');
                                if (newFileForm) {
                                    newFileForm.setAttribute('data-selected-channel', radio.value);
                                }
                                if (nextButton) {
                                    nextButton.style.display = 'block';
                                }
                                if (createContractButton) {
                                    createContractButton.style.display = 'none';
                                }
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching channels:', error);
            });
    } else {
        const newFileForm = document.getElementById('newFileForm');
        if (newFileForm) newFileForm.removeAttribute('data-selected-channel');
        const nextButton = document.getElementById('nextToStep3');
        if (nextButton) {
            nextButton.style.display = 'none';
        }
        const createContractButton = document.getElementById('createContractButton');
        if (createContractButton) {
            createContractButton.style.display = 'block';
        }
    }
};

export const fetchServiceProviders = () => {
    const apiUrl = 'https://spk.nathansenn.spk.tv/services/IPFS';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const providers = data.providers;
            const serviceProviderSelect = document.getElementById('serviceProvider');
            serviceProviderSelect.innerHTML = '';
            for (const providerName in providers) {
                const option = document.createElement('option');
                option.value = providerName;
                option.textContent = providerName;
                serviceProviderSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error fetching service providers:', error);
        });
};

export const pollForNewChannels = (username) => {
    const statusBar = document.getElementById('statusBar');
    const statusMessage = document.getElementById('statusMessage');
    if (statusBar && statusMessage) {
        statusBar.style.display = 'block';
        statusMessage.textContent = 'Looking for open channels...';
    }
    const pollInterval = 5000;
    const maxAttempts = 12;
    let attempts = 0;

    const poll = () => {
        if (attempts < maxAttempts) {
            fetchChannels();
            const channelsList = document.getElementById('channelsList');
            if (channelsList && channelsList.children.length > 0) {
                if (statusBar && statusMessage) {
                    statusBar.style.display = 'none';
                }
                return;
            }
            attempts++;
            if (statusMessage) {
                statusMessage.textContent = `Polling for channels... (${attempts}/${maxAttempts})`;
            }
            setTimeout(poll, pollInterval);
        } else {
            if (statusMessage) {
                statusMessage.textContent = 'No open channels found after 1 minute.';
            }
            alert('No open channels found after 1 minute.');
            if (statusBar) {
                statusBar.style.display = 'none';
            }
        }
    };

    poll();
};

export const storeSelectedFilesOnBlockchain = () => {
    const username = localStorage.getItem('hive_username');
    const selectedCheckboxes = document.querySelectorAll('.image-checkbox:checked');
    const contractIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.closest('.image-placeholder').dataset.contractId);
    if (username && contractIds.length && window.hive_keychain) {
        const operations = [
            [
                "custom_json",
                {
                    "required_auths": [username],
                    "required_posting_auths": [],
                    "id": "spkcc_store",
                    "json": JSON.stringify({
                        "items": contractIds
                    })
                }
            ]
        ];
        window.hive_keychain.requestBroadcast(
            username,
            operations,
            'Active',
            function (response) {
                console.log('Store operation broadcast response:', response);
                if (response.success) {
                    alert('File storage request for selected files successfully broadcasted to the blockchain.');
                } else {
                    alert('Failed to broadcast file storage request: ' + response.message);
                }
            }
        );
    } else {
        alert('Hive Keychain is not installed or no files are selected.');
    }
};

export const extendContractOnBlockchain = () => {
    const username = localStorage.getItem('hive_username');
    const extendModal = document.getElementById('extendStoreModal');
    const contractId = extendModal.dataset.contractId;
    const cost = document.getElementById('extendDurationForm').getAttribute('data-cost');
    if (username && contractId && cost && window.hive_keychain) {
        const operations = [
            [
                "custom_json",
                {
                    "required_auths": [username],
                    "required_posting_auths": [],
                    "id": "spkcc_extend",
                    "json": JSON.stringify({
                        "broca": parseInt(cost, 10),
                        "id": contractId,
                        "file_owner": username,
                        "power": 0
                    })
                }
            ]
        ];
        window.hive_keychain.requestBroadcast(
            username,
            operations,
            'Active',
            function (response) {
                console.log('Extend operation broadcast response:', response);
                if (response.success) {
                    alert('Extend storage request successfully broadcasted to the blockchain.');
                } else {
                    alert('Failed to broadcast extend storage request: ' + response.message);
                }
            }
        );
    } else {
        alert('Hive Keychain is not installed or the contract ID/cost is missing.');
    }
};
