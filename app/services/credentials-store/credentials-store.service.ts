import { Injectable } from "@angular/core";
const CryptoJS = require("crypto-js");
const JsonFile = require("jsonfile");
import * as OS from "os";

const FILE_NAME = ".creds.json";

@Injectable()
export class CredentialsStoreService {
    constructor() {}

    public getLastSignedInUsername(): Promise<string> {
        return this.getDecryptedCreds().then((json: any) => {
            return json ? json.username : undefined;
        });
    }
    // username field is kept for the future where we can store multiple user credentials
    public getDecryptedPassword(username: string): Promise<string> {
        return this.getDecryptedCreds().then((json: any) => {
            return json ? json.password : undefined;
        });
    }

    public getDecryptedCreds(): Promise<string> {
        return new Promise((resolve, reject) => {
            const json = JsonFile.readFileSync(FILE_NAME);
            if (!json) {
                reject("file not read");
            }

            json.username = CryptoJS.AES.decrypt(json.username.toString(), OS.hostname()).toString(CryptoJS.enc.Utf8);
            json.password = CryptoJS.AES.decrypt(json.password.toString(), OS.hostname()).toString(CryptoJS.enc.Utf8);
            resolve(json);
        });
    }

    public encryptAndStore(username: string, password: string): Promise<boolean> {
        // OS.hostname() is the key.
        // AES encryption
        const encryptedPassword = CryptoJS.AES.encrypt(password, OS.hostname());
        const encryptedUsername = CryptoJS.AES.encrypt(username, OS.hostname());
        const obj = {username: encryptedUsername.toString(), password: encryptedPassword.toString()};

        return JsonFile
        .writeFile(FILE_NAME, obj)
        .then(() => true)
        .catch((err) => false);
    }
}
