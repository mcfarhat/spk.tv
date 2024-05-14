import { logout, updateLoginStatus } from './login.js';
import { storeSelectedFilesOnBlockchain, extendContractOnBlockchain } from './contracts.js';
import { displayWallet } from './wallet.js';

// Get the modal
var modal = document.getElementById("loginModal");

// Get the button that opens the modal
var btn = document.getElementById("loginButton");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

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
    // Hive blockchain API endpoint (change if you have a specific node you're using)
    const apiUrl = 'https://api.hive.blog';

    // Hive API request body
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
                // Assuming the balance is in the 'balance' field of the response
                const balance = data.result[0].balance;
                document.getElementById('balance').innerText = balance; // Display only the balance
            } else {
                document.getElementById('balance').innerText = ''; // Clear the balance text
            }
        })
        .catch(error => {
            console.error('Error fetching Hive balance:', error);
            document.getElementById('balance').innerText = ''; // Clear the balance text
        });
}

// Update the login button to show the user's profile picture after successful login
// This function will be called after a successful login
export function updateUserProfilePicture(username) {
    // Hive blockchain API endpoint
    const apiUrl = 'https://api.hive.blog';
    const spkApiUrl = `https://spktest.dlux.io/@${username}`;
    // Update the login button to show "Logout" instead of "Login"
    const loginButton = document.getElementById('loginButton');
    loginButton.textContent = 'Logout';
    loginButton.removeEventListener('click', btn.onclick);
    loginButton.addEventListener('click', logout);

    // Hive API request body to get account details
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
                // Extracting profile picture URL from posting_json_metadata
                const postingMetaData = data.result[0].posting_json_metadata ? JSON.parse(data.result[0].posting_json_metadata) : {};
                const profilePictureUrl = postingMetaData.profile && postingMetaData.profile.profile_image ? postingMetaData.profile.profile_image : 'default_profile_pic_url.jpg';

                // Update the login button to show the profile picture
                var loginButton = document.getElementById("loginButton");
                loginButton.style.backgroundImage = "url('" + profilePictureUrl + "')";
                loginButton.style.backgroundSize = 'cover';
                loginButton.textContent = ''; // Remove the text from the button

                // Fetch additional user data from SPK API
                fetch(spkApiUrl)
                    .then(response => response.json())
                    .then(data => {
                        // Handle the SPK API data
                        // Extract and display the Broca balance
                        if (data.broca) {
                            const brocaBalance = data.broca.split(',')[0];
                            document.getElementById('balance').innerText = `Broca: ${brocaBalance}`;
                            document.getElementById('brocaBalance').innerText = `${brocaBalance} BROCA`;
                        }
                        // Extract and display the SPK Power balance
                        if (data.spk_power) {
                            const spkPowerBalance = data.spk_power;
                            document.getElementById('spkPowerBalance').innerText = `${spkPowerBalance} SPK Power`;
                        }
                        // Extract and display the SPK balance
                        if (data.spk) {
                            const spkBalance = data.spk;
                            document.getElementById('spkBalance').innerText = `${spkBalance} SPK`;
                        }
                        updateImagePlaceholders(data.file_contracts);
                        // You can update the UI or perform other actions with the data here
                    })
                    .catch(error => {
                        console.error('Error fetching data from SPK API:', error);
                    });
            } else {
                console.log('Unable to fetch account details');
            }
        })
        .catch(error => {
            console.error('Error fetching account details:', error);
        });
}

// Function to open the image in a modal for larger view
function openImageModal(imageUrl) {
    const imageModal = document.getElementById('imageModal');
    const imageModalContent = document.getElementById('imageModalContent');
    imageModalContent.src = imageUrl;
    imageModal.style.display = 'block';
}

// Event listener for image clicks to open the image modal
document.querySelector('.image-grid').addEventListener('click', function(event) {
    if (event.target.className === 'image-thumbnail') {
        openImageModal(event.target.src);
    }
});

// Function to display the image in a modal
function displayImageModal(imageSrc) {
    // Create the modal if it doesn't exist
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

        // Get the <span> element that closes the modal
        const span = modal.getElementsByClassName("close")[0];
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Set the image source
    const modalImg = modal.getElementsByClassName('modal-image')[0];
    modalImg.src = imageSrc;

    // Display the modal
    modal.style.display = "block";
}

// Function to update image placeholders with images from IPFS hashes
export function updateImagePlaceholders(fileContracts) {
    const imageGrid = document.querySelector('.image-grid');
    imageGrid.innerHTML = ''; // Clear existing placeholders or images

    for (const contractId in fileContracts) {
        const contract = fileContracts[contractId];
        if (contract.df) {
            for (const ipfsHash in contract.df) {
                const fileSize = contract.df[ipfsHash];
                console.log('IPFS hash:', ipfsHash);
                console.log('File size:', fileSize);
                const imageUrl = `https://ipfs.dlux.io/ipfs/${ipfsHash}`;
                const imageElement = document.createElement('div');
                imageElement.classList.add('image-placeholder');
                imageElement.innerHTML = `
                    <label class="image-checkbox-label">
                        <input type="checkbox" class="image-checkbox">
                        <span class="image-checkbox-custom"></span>
                    </label>
                    <img src="${imageUrl}" class="image-thumbnail" />
                    <div class="image-title">${contractId}</div>
                    <button class="add-button">+</button>
                `;
                imageElement.dataset.contractId = contract.i; // Save the contract ID in a data attribute
                imageElement.dataset.fileSize = fileSize; // Save the file size in a data attribute
                imageGrid.appendChild(imageElement);

                // Add event listeners for image and button interactions
                addImageEventListeners(imageElement, imageUrl, contract);
                imageGrid.appendChild(imageElement);
            }
        }
    }
    // After updating the placeholders, re-attach event listeners to the new checkboxes
    updateCheckboxEventListeners();
}

// Function to add event listeners for image and button interactions
function addImageEventListeners(imageElement, imageUrl, contract) {
    // Add click event listener to open the image in a modal
    imageElement.querySelector('.image-thumbnail').addEventListener('click', function() {
        displayImageModal(imageUrl);
    });

    // Add click event listener for the "+" button to open the extend and store file modal
    imageElement.querySelector('.add-button').addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the image modal from opening
        populateStorageNodes(contract.n); // Populate storage nodes list
        document.getElementById('extendStoreModal').style.display = 'block';
        document.getElementById('extendStoreModal').dataset.contractId = contract.i; // Save the contract ID in the modal's data attribute
    });
}

// Function to populate storage nodes in the modal
function populateStorageNodes(storageNodes) {
    const storageNodesList = document.getElementById('storageNodesList');
    storageNodesList.innerHTML = ''; // Clear existing nodes
    Object.values(storageNodes).forEach(function(node) {
        const listItem = document.createElement('li');
        listItem.textContent = node;
        storageNodesList.appendChild(listItem);
    });
}

// Function to select or deselect all checkboxes
function toggleSelectAllCheckboxes() {
    const checkboxes = document.querySelectorAll('.image-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    console.log(`Select All button clicked: ${allChecked ? 'Deselecting all checkboxes' : 'Selecting all checkboxes'}`);
    checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
    toggleStoreFilesButtonVisibility(); // Update the "Store Files" button visibility based on the new checkbox states
}

// Function to toggle the "Store Files" button visibility based on selected checkboxes
function toggleStoreFilesButtonVisibility() {
    const anyCheckboxSelected = Array.from(document.querySelectorAll('.image-checkbox')).some(checkbox => checkbox.checked);
    document.getElementById('storeFilesButton').style.display = anyCheckboxSelected ? 'inline-block' : 'none';
}

// Function to update event listeners for checkboxes
function updateCheckboxEventListeners() {
    document.querySelectorAll('.image-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', toggleStoreFilesButtonVisibility);
    });
}

// Function to open the Extend Duration Modal
function openExtendDurationModal() {
    var extendModal = document.getElementById('extendDurationModal');
    if (extendModal) {
        extendModal.style.display = 'block';
    } else {
        console.error('Extend Duration Modal not found');
    }
}

// Function to calculate and display the cost for the selected duration
function calculateExtendCost(fileSize) {
    console.log('Calculating cost for file size:', fileSize);
    const durationSelect = document.getElementById('extendDurationSelect');
    const duration = durationSelect.value;
    const costPer1024Bytes = 10; // Cost per 1024 bytes
    const cost = Math.ceil(fileSize / 1024) * costPer1024Bytes * duration; // Calculate the cost
    document.getElementById('extendCost').innerText = `Cost: ${cost} BROCA`; // Display the cost
    document.getElementById('extendDurationForm').setAttribute('data-duration', duration); // Store the duration in the form attribute
    document.getElementById('extendDurationForm').setAttribute('data-cost', cost); // Store the cost in the form attribute
}

// Function to display all contracts
export function displayAllContracts() {
    console.log("filter")
    fetch('https://spktest.dlux.io/feed')
        .then(response => response.json())
        .then(data => {
            const feed = data.feed;
            const filterToggle = document.getElementById('filterContractsToggle').checked;
            const filteredFeed = Object.entries(feed)

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
                        // Filter logic here, for example, to keep contracts with more than 3 storage nodes:
                        const filteredContracts = {};
                        for (const contractId in fileContracts) {
                            const contract = fileContracts[contractId];
                            if (filterToggle && Object.keys(contract.n).length < 3) {
                                filteredContracts[contractId] = contract;
                            }
                            else if (!filterToggle) {
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
            document.querySelector('.image-grid').style.display = 'grid'; // Show the image grid
            document.getElementById('walletContent').style.display = 'none'; // Hide the wallet content
        })
        .catch(error => {
            console.error('Error fetching feed:', error);
        });
}

// Function to display the user's files
export function displayMyFiles() {
    const username = localStorage.getItem('hive_username');
    if (username) {
        // Fetch user's files from the blockchain or a database
        // For demonstration, we'll call a function that updates the image placeholders
        // This should be replaced with actual logic to fetch user's files
        updateUserProfilePicture(username); // Assuming this function fetches and displays the files
        document.querySelector('.image-grid').style.display = 'grid'; // Show the image grid
        document.getElementById('walletContent').style.display = 'none'; // Hide the wallet content
    } else {
        // If no username is found, display a message or redirect to login
        console.log('User is not logged in. Redirecting to login...');
        window.location.hash = '#login'; // Redirect to login page or display a message
    }
}

// Add event listener for the "Select All" button
document.getElementById('selectAllButton').addEventListener('click', toggleSelectAllCheckboxes);

// Add event listener for the "Store Selected Files" button
document.getElementById('storeFilesButton').addEventListener('click', storeSelectedFilesOnBlockchain);

// Add event listener for the "Extend" button
document.getElementById('extendButton').addEventListener('click', openExtendDurationModal);

// Add event listener for the "Extend" button to calculate cost when modal opens
document.getElementById('extendButton').addEventListener('click', function() {
    const extendModal = document.getElementById('extendStoreModal');
    const contractId = extendModal.dataset.contractId;
    const imageElement = document.querySelector(`.image-placeholder[data-contract-id="${contractId}"]`);
    const fileSize = imageElement ? parseInt(imageElement.dataset.fileSize, 10) : 0;
    calculateExtendCost(fileSize);
});

// Add event listener for changes to the duration select to recalculate cost
document.getElementById('extendDurationSelect').addEventListener('change', function() {
    const extendModal = document.getElementById('extendStoreModal');
    const contractId = extendModal.dataset.contractId;
    const imageElement = document.querySelector(`.image-placeholder[data-contract-id="${contractId}"]`);
    const fileSize = imageElement ? parseInt(imageElement.dataset.fileSize, 10) : 0;
    calculateExtendCost(fileSize);
});

// Add event listener for the "Extend Contract" button
document.getElementById('extendContractButton').addEventListener('click', extendContractOnBlockchain);

// Add event listener for the filter toggle
document.getElementById('filterContractsToggle').addEventListener('change', displayAllContracts);

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    var extendModal = document.getElementById('extendDurationModal');
    var loginModal = document.getElementById('loginModal');
    var powerUpModal = document.getElementById('powerUpModal');
    if (event.target == extendModal) {
        extendModal.style.display = "none";
    } else if (event.target == loginModal) {
        loginModal.style.display = "none";
    } else if (event.target == powerUpModal) {
        powerUpModal.style.display = "none";
    }
}

// Add event listener for the "All Contracts" button
window.addEventListener('hashchange', handleHashChange);

// Function to handle hash changes in the URL
function handleHashChange() {
    const hash = window.location.hash;
    if (hash === '#allContracts') {
        displayAllContracts();
    } else if (hash === '#myFiles') {
        displayMyFiles();
    } else if (hash === '#wallet') {
        displayWallet();
    }
}
