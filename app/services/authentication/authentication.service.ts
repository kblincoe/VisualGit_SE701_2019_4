import { Injectable } from "@angular/core";
import * as github from "octonode";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthenticationService {
    public loggedIn: boolean = false;
    public user: string = "";

    constructor(private userService: UserService) {}

    public logIn(username: string, password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const client = github.client({
                username: username,
                password: password
            });
            const gitHubClient = client.me();

            gitHubClient.info((error, data, headers) => {
                if (error) {
                    reject(error);
                } else {
                    // AuthenticationService is responsible for keeping track of which user is currently logged in.
                    this.userService.logIn(gitHubClient, data);
                    resolve("Logged in.");
                }
            });
        });
    }

    public logOut(): void {
        this.userService.logOut();
    }

    public createGitHubClient(username: string, password: string): any {
        return github.client({ username, password }).me();
    }

}