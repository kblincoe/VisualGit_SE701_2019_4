import * as CryptoJS from "crypto-js";
import * as os from "os";
import * as jsonfile from "jsonfile";
let encryptedPassword;
let encryptedUsername;

export function encrypt(username, password) {

    // OS.hostname() is the key.
    // AES encryption

    encryptedUsername = CryptoJS.AES.encrypt(username, os.hostname());
    encryptedPassword = CryptoJS.AES.encrypt(password, os.hostname());

    writetoJSON(encryptedUsername, encryptedPassword);

}

export function encryptTemp(username, password) {
    encryptedUsername = CryptoJS.AES.encrypt(username, os.hostname());
    encryptedPassword = CryptoJS.AES.encrypt(password, os.hostname());
}

export function getUsernameTemp() {

    let decryptedUsernameBytes = CryptoJS.AES.decrypt(encryptedUsername.toString(), os.hostname());
    return decryptedUsernameBytes.toString(CryptoJS.enc.Utf8);
}

export function getPasswordTemp() {

    let decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword.toString(), os.hostname());
    return decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);
}

function writetoJSON(encryptedUsername, encryptedPassword) {

    // console.log("encrypted username is: " + encryptedUsername);
    let file = "data.json";
    let obj = { username: encryptedUsername.toString(), password: encryptedPassword.toString() };

    jsonfile.writeFile(file, obj, function (err) {
        if (err) { throw err; }
        console.log("Saved!");

    });

}
