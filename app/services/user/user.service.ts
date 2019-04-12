import { Injectable } from "@angular/core";
import { RepositoryListItem } from "../../misc/RepositoryListitemInterface";
import { Cred } from "nodegit"
import { repoLoaded } from '../../misc/git'

@Injectable()
export class UserService {
    public loggedIn: boolean = false;
    public username: string = "";
    public email: string = "";
    public userAvatarUrl: string = "";
    public credentials: any;
    private gitHubClient: any;
    public repos: Array<RepositoryListItem> = [];
    public hasMultipleRepos: boolean = false;

    public async logIn(gitHubClient, data: any, credentials: Cred): Promise<void> {
        this.username = data.username ? data.userInfo : data.login;
        this.credentials = credentials;
        this.gitHubClient = gitHubClient;
        this.email = await this.retrieveEmail();
        this.repos = await this.getRepoList();
        await this.retrieveUserAvatar();
        this.loggedIn = true;
    }

    public logOut(): void {
        repoLoaded = false;
        this.username = "";
        this.email = "";
        this.gitHubClient = undefined;
        this.loggedIn = false;
        this.credentials = undefined;
        this.repos = [];
        this.hasMultipleRepos = false;
    }

    public getCredentials(): Cred {
        let creds = this.credentials;
        return creds;
    }

    public getRepoList(): Promise<Array<RepositoryListItem>> {
        return new Promise((resolve, reject) => {
            this.gitHubClient.repos((err, val, headers) => {
                if (val) {
                    this.hasMultipleRepos = val.length > 1
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
