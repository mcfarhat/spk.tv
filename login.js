import {fetchHiveBalance, updateImagePlaceholders, handleInitialHash} from './ui.js';


let loginFormEventListenerAdded = false;
// Get the button that opens the modal
let btn = document.getElementById("loginButton");
let modal = document.getElementById("loginModal");
// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

document.addEventListener('DOMContentLoaded', function() {
    if (!loginFormEventListenerAdded) {
        loginFormEventListenerAdded = true;
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginFormSubmit);
        }
    }

    const savedUsername = localStorage.getItem('hive_username');
    if (savedUsername) {
        // Perform login actions as if the user has just logged in
        fetchHiveBalance(savedUsername);
        // Update the UI to reflect that the user is logged in
        updateLoginStatus(true, savedUsername);
    }
    handleInitialHash();
});


function handleLoginFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    if (window.hive_keychain) {
        console.log('Logging in with Hive Keychain:', username);
        window.hive_keychain.requestSignBuffer(
            username,
            'Login request message',
            'Posting',
            async function(response) {
                if (response.success) {
                    // Save username to localStorage and update the balance and profile picture
                    localStorage.setItem('hive_username', username);
                    fetchHiveBalance(response.data.username);
                    // Fetch public keys from Hive and DLUX APIs
                    const hiveApiUrl = `https://api.hive.blog`;
                    const dluxApiUrl = `https://spktest.dlux.io/@${username}`;
                    try {
                        const [hiveRes, dluxRes] = await Promise.all([
                            fetch(hiveApiUrl, {
                                method: 'POST',
                                body: JSON.stringify({
                                    jsonrpc: '2.0',
                                    method: 'condenser_api.get_accounts',
                                    params: [[username]],
                                    id: 1
                                }),
                                headers: {'Content-Type': 'application/json'}
                            }),
                            fetch(dluxApiUrl)
                        ]);
                        const [hiveData, dluxData] = await Promise.all([hiveRes.json(), dluxRes.json()]);
                        const hivePubKey = hiveData.result[0].posting.key_auths[0][0];
                        const dluxPubKey = dluxData.pubKey;
                        console.log('Hive public key:', hivePubKey);
                        console.log('DLUX public key:', dluxPubKey);
                        if (hivePubKey === dluxPubKey) {
                            console.log('Public keys match, login successful.');
                            updateUserProfilePicture(username);
                        } else {
                            console.log('Public keys do not match, login failed.');
                            // Post a register transaction to Hive via Keychain
                            const registerOps = [
                                [
                                    "custom_json",
                                    {
                                        "required_auths": [username],
                                        "required_posting_auths": [],
                                        "id": "spkcc_register_authority",
                                        "json": JSON.stringify({"pubKey": hivePubKey})
                                    }
                                ]
                            ];
                            window.hive_keychain.requestBroadcast(
                                username,
                                registerOps,
                                'Active',
                                function(response) {
                                    if (response.success) {
                                        console.log('Register transaction successful:', response);
                                    } else {
                                        console.error('Register transaction failed:', response.message);
                                    }
                                },
                                'Register Authority'
                            );
                            const sidebarBalance = document.getElementById('sidebarBalance');
                            if (sidebarBalance) {
                                sidebarBalance.innerText = `${brocaBalance} BROCA`;
                            }
                            const balanceElement = document.getElementById('balance');
                            if (balanceElement) {
                                sidebarBalance.innerText = balanceElement.innerText;
                            }
                        }

                    } catch (error) {
                        console.error('Error fetching public keys:', error);
                    }
                } else {
                    document.getElementById('loginStatus').innerText = 'Login failed';
                }
            }
        );
    } else {
        alert('Hive Keychain is not installed');
    }
}

// Function to update the UI to reflect the user's login status
function updateLoginStatus(isLoggedIn, username) {
    console.log('Updating login status:', isLoggedIn, username);
    const loginButton = document.getElementById('loginButton');
    const balanceElement = document.getElementById('balance');
    if (isLoggedIn) {
        loginButton.textContent = 'Logout';
        loginButton.onclick = logout;
        fetchHiveBalance(username);
        updateUserProfilePicture(username);
    } else {
        loginButton.textContent = 'Login';
        loginButton.onclick = function() {
            modal.style.display = "block";
        };
        balanceElement.innerText = '';
    }
}

// Function to handle user logout
export function logout() {
    localStorage.removeItem('hive_username');
    updateLoginStatus(false);
    window.location.reload(); // Optional: Reload the page to reset the state
}
// This function will be called after a successful login
function updateUserProfilePicture(username) {
    console.log('Fetching user profile picture:', username);
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
                const loginButton = document.getElementById("loginButton");
                const sidebarLoginButton = document.getElementById("sidebarLoginButton");

                loginButton.style.backgroundImage = "url('" + profilePictureUrl + "')";
                loginButton.style.backgroundSize = 'cover';
                loginButton.textContent = ''; // Remove the text from the button

                if (sidebarLoginButton) {
                    sidebarLoginButton.style.backgroundImage = "url('" + profilePictureUrl + "')";
                    sidebarLoginButton.style.backgroundSize = 'cover';
                    sidebarLoginButton.textContent = ''; // Remove the text from the button
                }

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
