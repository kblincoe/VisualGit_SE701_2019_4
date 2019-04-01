import { Injectable } from "@angular/core";
let github = require("octonode");

@Injectable()
export class AuthenticationService {
    public loggedIn: boolean = false;
    public user: string = "";

    public logIn(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const client = this.createGitHubClient(username, password);

            client.info((error, data, headers) => {
                if (error) {
                    reject(error);
                } else {
                    // AuthenticationService is responsible for keeping track of which user is currently logged in.
                    this.loggedIn = true;
                    this.user = username;
                    resolve(true);
                }
            });
        });
    }

    public logOut(): void {
        this.user = "";
        this.loggedIn = false;
    }

    public createGitHubClient(username: string, password: string): any {
        return github.client({ username, password }).me();
    }

}