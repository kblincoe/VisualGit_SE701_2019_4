import { Injectable } from "@angular/core";

@Injectable()
export class UserService {
    public loggedIn: boolean = false;
    public username: string = "";
    public email: string = "";
    private gitHubClient: any;

    public async logIn(gitHubClient, data: any): Promise<void> {
        this.username = data.username ? data.userInfo : data.login;
        this.gitHubClient = gitHubClient;
        await this.retrieveAndSetEmail();
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
}
