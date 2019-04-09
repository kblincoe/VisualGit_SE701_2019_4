import { Injectable } from "@angular/core";
import { RepositoryListItem } from "../../misc/RepositoryListitemInterface";

@Injectable()
export class UserService {
    public loggedIn: boolean = false;
    public username: string = "";
    public email: string = "";
    public userAvatarUrl: string = "";
    private gitHubClient: any;

    public async logIn(gitHubClient, data: any): Promise<void> {
        this.username = data.username ? data.userInfo : data.login;
        this.gitHubClient = gitHubClient;
        await this.retrieveAndSetEmail();
        await this.retrieveUserAvatar();
        this.loggedIn = true;
    }

    public logOut(): void {
        this.username = "";
        this.email = "";
        this.gitHubClient = undefined;
        this.loggedIn = false;
    }

    private retrieveAndSetEmail(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gitHubClient.emails((err, val, headers) => {
                if (val) {
                    this.email = val[0].email; // array of emails
                    resolve(val);
                } else {
                    this.email = "";
                    reject(undefined);
                }
            });
        });
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

}
