import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { displayModal } from "../../misc/repo";
import { CredentialsStoreService } from "../../services/credentials-store/credentials-store.service";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { ThemeService } from "../../services/theme.service";
import { UserService } from "../../services/user/user.service";

@Component({
    selector: "user-auth",
    templateUrl: "./authenticate.component.html",
})

export class AuthenticateComponent implements OnInit {
    public username: string = "";
    public password: string = "";
    public cache: boolean = false;
    public isCached: boolean = false;

    constructor(private authenticationService: AuthenticationService,
                private credService: CredentialsStoreService,
                private userService: UserService,
                private router: Router,
                private location: Location,
                private themeService: ThemeService) { }

    // Can't make this private or protect as it's public in the interface
    public ngOnInit(): void {

        this.themeService.setColors();

        // Load any stored username
        this.credService.getLastSignedInUsername().then((val) => {
            this.username = val !== undefined ? val : this.username;
            this.isCached = val !== undefined;
        });
    }

    public logIn(username: string, password: string, id: string): void {
        document.getElementById(id).innerHTML= "Signing In...";
        this.authenticationService.logIn(username, password).then(
            (success) => {
                // Clear input fields after successful login
                this.username = "";
                this.password = "";
                document.getElementById("SignInChange").innerHTML= "Sign In";
                this.switchToAddRepositoryPanel();
                if (this.cache) {
                    this.credService.encryptAndStore(username, password)
                    .then((result: boolean) => {
                        this.isCached = result;
                    });
                }
            },
            (error) => {
                this.displayWarning(error);
                document.getElementById("SignInChange").innerHTML= "Sign In";
            });
    }

    public switchToAddRepositoryPanel(): void {
        this.router.navigate(['/panel/repository/add']);
    }

    public logInWithSaved(): void {
        this.credService.getDecryptedCreds()
            .then((json: any) => {
                if (json) {
                    this.logIn(json.username, json.password, "SignInChange2");
                } else {
                    this.isCached = false;
                    this.displayWarning("No credentials saved.");
                }
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