import { Injectable } from "@angular/core";
import * as github from "octonode";

@Injectable()
export class AuthenticationService {
    public loggedIn: boolean = false;
    public user: string = "";
    private gitHubClient: any;

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

    public logOut(): void {
        this.user = "";
        this.loggedIn = false;
    }
}
