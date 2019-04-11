import { Injectable } from "@angular/core";
import { RepositoryListItem } from "../../misc/RepositoryListitemInterface";
import { Cred } from "nodegit"

@Injectable()
export class UserService {
    public loggedIn: boolean = false;
    public username: string = "";
    public email: string = "";
    public userAvatarUrl: string = "";
    public credentials: any;
    private gitHubClient: any;

    public async logIn(gitHubClient, data: any, credentials: Cred): Promise<void> {
        this.username = data.username ? data.userInfo : data.login;
        this.credentials = credentials;
        this.gitHubClient = gitHubClient;
        await this.retrieveEmail();
        await this.retrieveUserAvatar();
        this.loggedIn = true;
    }

    public logOut(): void {
        this.username = "";
        this.email = "";
        this.gitHubClient = undefined;
        this.loggedIn = false;
        this.credentials = undefined;
    }

    public getRepoList(): Promise<Array<RepositoryListItem>> {
        return new Promise((resolve, reject) => {
            this.gitHubClient.repos((err, val, headers) => {
                if (val) {
                    resolve(val); //returns an array of repo objects
                } else {
                    reject(err);
                }
            });
        });
    }

    public retrieveUserAvatar(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gitHubClient.info((error, data, headers) => {
                if (error != null) {
                    reject(error);
                } else {
                    this.userAvatarUrl = data["avatar_url"];
                    resolve(data);
                }
            });
        });
    }

    private retrieveEmail(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.gitHubClient.emails((err, val, headers) => {
                if (val) {
                    const email = val[0].email; // array of emails
                    resolve(email);
                } else {
                    console.log(err);
                    reject("");
                }
            });
        });
    }
}
