import { Component } from "@angular/core";
import { GraphService } from "../../services/graph.service";
import { RepositoryService } from "../../services/repository.service";
import { createBranch, pushToRemote, pullFromRemote, cleanRepo, requestLinkModal, Reload, Close, fetchFromOrigin } from "../../misc/git";
import { getOtherBranches } from "../../misc/repo";
import { cloneRepo } from "../../misc/authenticate";
import { Router } from "@angular/router";
import { UserService } from "../../services/user/user.service";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    providers: [RepositoryService, GraphService],
})

export class HeaderComponent {
    public repoName: string;
    public repoBranch: string;
    public repository: any;

    constructor(public userService: UserService, private router: Router) {
        this.repoName = "Repo name";
        this.repoBranch = "Repo branch";
    }

    public switchToAuthenticatePanel(): void {
        this.router.navigate(['/']);
    }

    public promptUserToAddRepository(): void {
        this.router.navigate(['/panel/repository/add']);
    }

    public switchToAddRepositoryPanel(): void {
        this.router.navigate(['/panel/repository/add']);
    }

    public switchToMainPanel(): void {
        this.router.navigate(['/panel/main']);
    }

    public WarningSignIn(): void {
        // TODO: Show a warning if there are commits which are not pushed.
    }

    public createBranch(): void {
        createBranch();
    }

    public pushToRemote(): void {
        pushToRemote();
    }

    public pullFromRemote(): void {
        pullFromRemote();
    }

    public cloneFromRemote(): void {
        this.router.navigate(['/panel/repository/clone']);
    }

    public cleanRepo(): void {
        cleanRepo();
    }

    public requestLinkModal(): void {
        requestLinkModal();
    }

    public getOtherBranches(): void {
        getOtherBranches();
    }

    public Reload(): void {
        Reload();
    }

    public Close(): void {
        Close();
    }

    public cloneRepo(): void {
        cloneRepo();
    }

    public fetchFromOrigin(): void {
        fetchFromOrigin();
    }

}
