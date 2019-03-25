import { Component } from "@angular/core";

@Component({
  selector: "user-auth",
  templateUrl: "authenticate.component.html",
})

export class AuthenticateComponent {
  public switchToMainPanel(): void {
    signInPage(switchToAddRepositoryPanel);
  }

  public createNewAccount(): void {
    window.open("https://github.com/join?", "_blank");
  }

}
