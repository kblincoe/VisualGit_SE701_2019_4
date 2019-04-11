import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { displayModal } from "../../misc/repo";
import { CredentialsStoreService } from "../../services/credentials-store/credentials-store.service";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { ThemeService } from "../../services/theme.service";
import { UserService } from "../../services/user/user.service";
import { PopupService } from "../../services/popup/popup.service";
import { PopupStyles } from "../popup/popup.component";

@Component({
    selector: "user-auth",
    templateUrl: "./authenticate.component.html",
})

export class AuthenticateComponent implements OnInit {
    public username: string = "";
    public password: string = "";
    public cache: boolean = false;
    public isCached: boolean = false;
    public signInText: string = "Sign in";
    public signInText2: string = "Sign in With Saved";
    

    constructor(private authenticationService: AuthenticationService,
                private credService: CredentialsStoreService,
                private userService: UserService,
                private router: Router,
                private location: Location,
                private themeService: ThemeService,
                private popupService: PopupService) { }

    // Can't make this private or protect as it's public in the interface
    public ngOnInit(): void {

        this.themeService.setColors();

        // Load any stored username
        this.credService.getLastSignedInUsername().then((val) => {
            this.username = val !== undefined ? val : this.username;
            this.isCached = val !== undefined;
        });
    }

    public logIn(username: string, password: string): void {;
      (<HTMLInputElement> document.getElementById("SignInButton")).disabled = true;    
      (<HTMLInputElement> document.getElementById("SignInButtonSaved")).disabled = true; 
      this.signInText = "Signing In..."
        
        this.authenticationService.logIn(username, password).then(
            (success) => {
                // Clear input fields after successful login
                this.username = "";
                this.password = "";
                this.signInText = "Sign In";
                (<HTMLInputElement> document.getElementById("SignInButton")).disabled = false;    
                (<HTMLInputElement> document.getElementById("SignInButtonSaved")).disabled = false; 
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
                this.signInText = "Sign In";
                (<HTMLInputElement> document.getElementById("SignInButton")).disabled = false;    
                (<HTMLInputElement> document.getElementById("SignInButtonSaved")).disabled = false; 
            });
    }

    public switchToAddRepositoryPanel(): void {
        this.router.navigate(['/panel/repository/add']);
    }

    public logInWithSaved(): void {
        this.credService.getDecryptedCreds()
            .then((json: any) => {
                if (json) {
                    this.logIn(json.username, json.password);
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
        this.popupService.showInfo(warningMessage, PopupStyles.Error);
    }

    public createNewAccount(): void {
        window.open("https://github.com/join?", "Create New Account");
    }

    public recoverPassword(): void {
        window.open("https://github.com/password_reset", "Forgot Your Password");
    }

}