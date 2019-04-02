import { Injectable } from "@angular/core";

@Injectable()
export class UserService {
    public loggedIn: boolean = false;
    public username: string;
    constructor() {}

    public logIn(username: string): void {
        this.username = username;
        this.loggedIn = true;
    }

    public logOut(): void {
        this.username = undefined;
        this.loggedIn = false;
    }
}