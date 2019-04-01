import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { displayModal } from "../../misc/repo";
import { CredentialsStoreService } from "../../services/credentials-store/credentials-store.service";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { ThemeService } from "../../services/theme.service";

@Component({
    selector: "user-auth",
    templateUrl: "./authenticate.component.html",
})

export class AuthenticateComponent implements OnInit {
    public username: string = "";
    public password: string = "";
    public cache: boolean = false;

    constructor(private authenticationService: AuthenticationService, 
                private credService: CredentialsStoreService, 
                private router: Router, 
                private location: Location,
                private themeService: ThemeService) { }

    // Can't make this private or protect as it's public in the interface
    public ngOnInit(): void {

        this.themeService.setColors();

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
            (error) => {
                this.displayWarning(error);
            });
    }

    public switchToAddRepositoryPanel(): void {
        this.router.navigate(['/panel/repository/add']);
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

    public goBack(): void {
        this.location.back();
    }

    public displayWarning(warningMessage: string) {
        displayModal(warningMessage);
    }

    public createNewAccount(): void {
        window.open("https://github.com/join?", "Create New Account");
    }

    public recoverPassword(): void {
        window.open("https://github.com/password_reset", "Forgot Your Password");
    }

}