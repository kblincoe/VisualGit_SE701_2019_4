import { Injectable } from "@angular/core";
let github = require("octonode");
let nodegit = require("nodegit")
import { UserService } from "../user/user.service";

@Injectable()
export class AuthenticationService {
    constructor(private userService: UserService) {}

    public logIn(username: string, password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const gitHubClient = this.createGitHubClient(username, password);

            gitHubClient.info((error, data, headers) => {
                if (error) {
                    reject(error);
                } else {
                    const credentials = nodegit.Cred.userpassPlaintextNew(username,
                                                                          password);
                    this.userService.logIn(gitHubClient, data, credentials);
                    resolve("Logged in.");
                }
            });
        });
    }

    public logOut(): void {
        this.userService.logOut();
    }

    // This method needs to exist for testing purposes
    public createGitHubClient(username: string, password: string): any {
        return github.client({ username, password }).me();
    }

}