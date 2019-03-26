import { switchToAddRepositoryPanel, useSaved } from "../misc/router";
import { changeColor } from "../misc/color";
import { Component, Input, ViewChild } from "@angular/core";
import { AuthenticationService } from "../services/authentication/authentication.service";
import { displayModal } from "../misc/repo";

@Component({
  selector: "user-auth",
  template: `
  <div class="authenticate" id="authenticate">
  <nav class="navbar navbar-inverse" role="navigation">
    <div class="container-fluid">
      <button class="btn btn-inverse dropdown-toggle btn-sm navbar-btn" id="color-scheme" data-toggle="dropdown">
        color
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" id="color-dropdown" role="menu" aria-labelledby="branch-name">
        <li class="white" (click)="changeColor('white')">white</li>
        <li class="pink" (click)="changeColor('pink')">pink</li>
        <li class="blue" (click)="changeColor('blue')">blue</li>
        <li class="navy" (click)="changeColor('navy')">navy</li>
        <li class="green" (click)="changeColor('green')">green</li>
        <li class="default" (click)="changeColor('default')">default</li>
      </ul>
    </div>
  </nav>
  <form role="form" style="text-align:center; margin-top:100px">
    <label>
      <h1>VisualGit</h1>
    </label>
    <br><br>

    <div *ngIf="!authenticationService.loggedIn">
      <div class="input-group" style="width:280px;">
        <input id="username" [(ngModel)]="username" type="text" class="form-control" placeholder="Username or Email" aria-describedby="basic-addon1">
      </div>
      <br>
      <div class="input-group" style="width:280px;">
        <input id="password" [(ngModel)]="password" type="password" class="form-control" placeholder="Password" aria-describedby="basic-addon1">
      </div>
      <br>
      <input id="rememberLogin" type="checkbox" [checked]="cache" (change)="cache = !cache"> Remember Login <br>
      <br>
      <div>
        <button type="submit" style="width:280px;" class="btn btn-success" (click)="logIn(username, password)">Sign In</button>
      </div>
      <br>
      <div>
        <button type="submit" style="width:280px;" class="btn btn-primary" (click)="useSaved()">Load Saved Credentials</button>
        <br>
        <br>
        <button style="width:280px;" class="btn btn-link" (click)="recoverPassword()">Forgot your password?</button>
        <br>
        <button style="width:280px;" class="btn btn-link" (click)="createNewAccount()">Create New Account?</button>
        <br>
        <br>
        <button type="submit" style="width:280px;" class="btn btn-primary" (click)="switchToAddRepositoryPanel()">Continue Without Sign In</button>
      </div>
    </div>

    <div *ngIf="authenticationService.loggedIn">
      <h2>{{authenticationService.user}}</h2>
      <br>
      <button type="submit" style="width:280px;" class="btn btn-success" (click)="logOut()">Sign Out</button>
    </div>
  </form>
</div>
  `,
})

export class AuthenticateComponent {
  public username: string = "";
  public password: string = "";
  public cache: boolean = false;

  constructor(private authenticationService: AuthenticationService) { }

  public logIn(username: string, password: string): void {
    this.authenticationService.logIn(username, password).then(
      (success) => {
        // Clear input fields after successful login if remember log in is not checked.
        if (!this.cache) {
          this.username = "";
          this.password = "";
        }
        this.switchToAddRepositoryPanel();
      },
      (failed) => {
        displayModal(failed);
      });
  }

  public logOut(): void {
    // TODO warning if files committed but not pushed before log out.
    this.authenticationService.logOut();
  }

  public changeColor(color: string): void {
    changeColor(color);
  }

  public switchToAddRepositoryPanel(): void {
    switchToAddRepositoryPanel();
  }

  public createNewAccount(): void {
    window.open("https://github.com/join?", "Create New Account");
  }

  public recoverPassword(): void {
    window.open("https://github.com/password_reset", "Forgot Your Password");
  }

}
