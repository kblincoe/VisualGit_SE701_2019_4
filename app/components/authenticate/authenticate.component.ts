import { switchToAddRepositoryPanel } from "../../misc/router";
import { changeColor } from "../../misc/color";
import { Component, Input, ViewChild, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { displayModal } from "../../misc/repo";
import { CredentialsStoreService } from "../../services/credentials-store/credentials-store.service";

@Component({
    selector: "user-auth",
    templateUrl: "./authenticate.component.html",
})

export class AuthenticateComponent {
    private username: string = "";
    private password: string = "";
    private cache: boolean = false;

    constructor(private authenticationService: AuthenticationService, private credService: CredentialsStoreService) { }

    // Can't make this private or protect as it's public in the interface
    public ngOnInit(): void {
        // Load any stored username
        this.credService.getLastSignedInUsername().then((val) => {
            if (val !== undefined) {
                this.username = val;
            }
        });
    }

    public logIn(username: string, password: string): void {
        this.authenticationService.logIn(username, password).then(
            (success) => {
                // Clear input fields after successful login
                this.username = "";
                this.password = "";
                this.switchToAddRepositoryPanel();
                if (this.cache) {
                    this.credService.encryptAndStore(username, password);
                }
            },
            (failed) => {
                displayModal(failed);
            });
    }

    public logInWithSaved(): void {
        this.credService.getDecryptedCreds()
            .then((json: any) => {
                this.logIn(json.username, json.password);
            });
    }

    public logOut(): void {
        // TODO warning if files committed but not pushed before log out.
        this.authenticationService.logOut();
    }

    public colorChange(color: string) {
        changeColor(color);
    }

    public switchToAddRepositoryPanel() {
        switchToAddRepositoryPanel();
    }

    public createNewAccount(): void {
        window.open("https://github.com/join?", "Create New Account");
    }

    public recoverPassword(): void {
        window.open("https://github.com/password_reset", "Forgot Your Password");
    }

}
