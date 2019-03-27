import * as CryptoJS from "crypto-js";
import * as jsonfile from "jsonfile";
import * as os from "os";
let file;

let encryptedPassword;
let encryptedUsername;

export function decrypt() {

    file = "data.json";

    const objRead = jsonfile.readFileSync(file); // JSON Object containing credentials

    encryptedUsername = objRead.username;
    encryptedPassword = objRead.password;

}

export function getUsername() {

    let decryptedUsernameBytes = CryptoJS.AES.decrypt(encryptedUsername.toString(), os.hostname());
    return decryptedUsernameBytes.toString(CryptoJS.enc.Utf8);
}

export function getPassword() {
    let decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword.toString(), os.hostname());
    return decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);
}
