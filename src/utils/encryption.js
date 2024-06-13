import CryptoJS from 'crypto-js';

export function encryptMessage(username, message, callback) {
    let key = generateRandomHash();
    key = "#" + key;
    window.hive_keychain.requestEncodeMessage(username, username, key, 'Memo', (response) => {
        if (response.success) {
            let encryptedKey = response.result;
            console.log("Encrypted key: ", response.result);
            let encryptedMessage = sha256Encrypt(message, key);
            console.log("Encrypted message: ", encryptedMessage);
            let encryptedMessageWithKey = "#" + encryptedKey + "#" + encryptedMessage;
            callback(null, encryptedMessageWithKey);
        } else {
            callback(response.message, null);
        }
    });
}

export function decryptMessage(username, encryptedMessage, callback) {
    let encryptedKey = encryptedMessage.split("#")[1];
    console.log("Encrypted key: ", encryptedKey);
    let encryptedMessageOnly = encryptedMessage.split("#")[2];
    console.log("Encrypted message: ", encryptedMessageOnly);
    window.hive_keychain.requestVerifyKey(username, '#' + encryptedKey, 'Memo', (response) => {
        if (response.success) {
            let key = response.result;
            console.log("Decrypted key: ", response.result);
            let message = sha256Decrypt(encryptedMessageOnly.replace(/^#/, ""), key);
            console.log("Decrypted message: ", message);
            callback(null, message);
        } else {
            callback(response.message, null);
        }
    });
}

export function generateRandomHash() {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

export function sha256Encrypt(message, key) {
    return CryptoJS.AES.encrypt(message, key).toString();
}

export function sha256Decrypt(encryptedMessage, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}
