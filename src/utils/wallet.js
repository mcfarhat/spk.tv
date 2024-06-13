// wallet.js
import { fetchHiveBalance } from './ui';

// Event listener for the SPK Power Up button to open the modal
if (document.getElementById('powerUpButton')) {
    document.getElementById('powerUpButton').addEventListener('click', () => {
        document.getElementById('powerUpModal').style.display = 'block';
    });
}

// Event listener for the available SPK balance to populate the input
if (document.getElementById('availableSPKBalance')) {
    document.getElementById('availableSPKBalance').addEventListener('click', () => {
        const balanceText = this.innerText;
        const balanceAmount = balanceText.split(' ')[0];
        document.getElementById('powerUpAmount').value = balanceAmount;
    });
}

// Event listener for the Power Up form submission
if (document.getElementById('powerUpForm')) {
    document.getElementById('powerUpForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const username = localStorage.getItem('hive_username');
        const amount = document.getElementById('powerUpAmount').value;
        if (window.hive_keychain && username && amount) {
            const customJson = JSON.stringify({
                "amount": parseFloat(amount)
            });
            window.hive_keychain.requestBroadcast(
                username,
                [
                    [
                        "custom_json",
                        {
                            "required_auths": [username],
                            "required_posting_auths": [],
                            "id": "spkcc_spk_up",
                            "json": customJson
                        }
                    ]
                ],
                'Active',
                function (response) {
                    console.log('Power Up transaction response:', response);
                    if (response.success) {
                        alert('SPK Power Up successful!');
                    } else {
                        alert('SPK Power Up failed: ' + response.message);
                    }
                }
            );
        } else {
            alert('Hive Keychain is not installed or the amount is invalid.');
        }
        document.getElementById('powerUpModal').style.display = 'none';
    });
}

// Function to display the wallet content area
export const displayWallet = () => {
    const username = localStorage.getItem('hive_username');
    if (username) {
        document.querySelector('.image-grid').style.display = 'none';
        document.getElementById('walletContent').style.display = 'block';
        document.getElementById('availableSPKBalance').innerText = document.getElementById('spkBalance').innerText;
        const brocaBalance = document.getElementById('balance').innerText.split(':')[1].trim();
    } else {
        window.location.hash = '#login';
    }
}
