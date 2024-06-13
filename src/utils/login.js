import { fetchHiveBalance, updateImagePlaceholders, handleInitialHash } from './ui';

let loginFormEventListenerAdded = false;

const login = () => {
    if (!loginFormEventListenerAdded) {
        loginFormEventListenerAdded = true;
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginFormSubmit);
        }
    }

    const savedUsername = localStorage.getItem('hive_username');
    if (savedUsername) {
        fetchHiveBalance(savedUsername);
        updateLoginStatus(true, savedUsername);
    }
    handleInitialHash();
};

export const handleLoginFormSubmit = (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    if (window.hive_keychain) {
        window.hive_keychain.requestSignBuffer(
            username,
            'Login request message',
            'Posting',
            async function (response) {
                if (response.success) {
                    localStorage.setItem('hive_username', username);
                    fetchHiveBalance(response.data.username);
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
                                headers: { 'Content-Type': 'application/json' }
                            }),
                            fetch(dluxApiUrl)
                        ]);
                        const [hiveData, dluxData] = await Promise.all([hiveRes.json(), dluxRes.json()]);
                        const hivePubKey = hiveData.result[0].posting.key_auths[0][0];
                        const dluxPubKey = dluxData.pubKey;
                        if (hivePubKey === dluxPubKey) {
                            updateUserProfilePicture(username);
                        } else {
                            const registerOps = [
                                [
                                    "custom_json",
                                    {
                                        "required_auths": [username],
                                        "required_posting_auths": [],
                                        "id": "spkcc_register_authority",
                                        "json": JSON.stringify({ "pubKey": hivePubKey })
                                    }
                                ]
                            ];
                            window.hive_keychain.requestBroadcast(
                                username,
                                registerOps,
                                'Active',
                                function (response) {
                                    if (response.success) {
                                        console.log('Register transaction successful:', response);
                                    } else {
                                        console.error('Register transaction failed:', response.message);
                                    }
                                },
                                'Register Authority'
                            );
                        }
                        updateLoginStatus(true, username);
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
};

const updateLoginStatus = (isLoggedIn, username) => {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const balanceElement = document.getElementById('balance');
    if (isLoggedIn) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        fetchHiveBalance(username);
        updateUserProfilePicture(username);
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        balanceElement.innerText = '';
    }
};

export const logout = () => {
    localStorage.removeItem('hive_username');
    updateLoginStatus(false);
    window.location.reload();
};

const updateUserProfilePicture = (username) => {
    const apiUrl = 'https://api.hive.blog';
    const spkApiUrl = `https://spktest.dlux.io/@${username}`;
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.style.backgroundImage = 'none';
    logoutButton.style.backgroundSize = 'cover';
    logoutButton.textContent = 'Logout';

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
                const postingMetaData = data.result[0].posting_json_metadata ? JSON.parse(data.result[0].posting_json_metadata) : {};
                const profilePictureUrl = postingMetaData.profile && postingMetaData.profile.profile_image ? postingMetaData.profile.profile_image : 'default_profile_pic_url.jpg';

                logoutButton.style.backgroundImage = "url('" + profilePictureUrl + "')";
                logoutButton.style.backgroundSize = 'cover';
                logoutButton.textContent = '';

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
            } else {
                console.log('Unable to fetch account details');
            }
        })
        .catch(error => {
            console.error('Error fetching account details:', error);
        });
};

document.addEventListener('DOMContentLoaded', login);
