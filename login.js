import { fetchHiveBalance, updateUserProfilePicture } from './ui.js';

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    if(window.hive_keychain) {
        window.hive_keychain.requestSignBuffer(
            username,
            'Login request message',
            'Posting',
            async function(response) {
                if(response.success) {
                    // Save username to localStorage and update the balance and profile picture
                    localStorage.setItem('hive_username', username);
                    fetchHiveBalance(response.data.username);
                    updateUserProfilePicture(response.data.username);
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
});

// Check if a username is saved in localStorage and auto-login
document.addEventListener('DOMContentLoaded', function() {
    const savedUsername = localStorage.getItem('hive_username');
    if (savedUsername) {
        // Perform login actions as if the user has just logged in
        fetchHiveBalance(savedUsername);
        updateUserProfilePicture(savedUsername);
        // Update the UI to reflect that the user is logged in
        updateLoginStatus(true, savedUsername);
    }
    handleInitialHash();
});

// Function to update the UI to reflect the user's login status
function updateLoginStatus(isLoggedIn, username) {
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

// Import the handleInitialHash function from ui.js
import { handleInitialHash } from './ui.js';
