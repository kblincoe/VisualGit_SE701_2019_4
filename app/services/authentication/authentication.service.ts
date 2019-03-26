import { Injectable } from "@angular/core";
import * as github from "octonode";

@Injectable()
export class AuthenticationService {
    public loggedIn: boolean = false;
    public user: string = "";
    private gitHubClient: any;

    // Should take in a CredentialService once implemented
    constructor() {}

    public logIn(username: string, password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const client = github.client({
                username: username,
                password: password
            });
            this.gitHubClient = client.me();

            this.gitHubClient.info((error, data, headers) => {
                if (error) {
                    reject(error);
                } else {
                    // AuthenticationService is responsible for keeping track of which user is currently logged in.
                    this.loggedIn = true;
                    this.user = username;
                    resolve("Logged in.");
                }
            });
        });
    }

    public logInWithSavedCredentials(username: string): Promise<string> {
        // log in with saved credential, fetching from CredentialService (using username as key)
        // let password: string = getPassword(username);
        return new Promise((resolve, reject) => {
            // return new Promise((resolve, reject) => {}
        });
    }

    public logOut(): void {
        this.user = "";
        this.loggedIn = false;
    }
}
