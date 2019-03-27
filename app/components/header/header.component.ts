import { Component } from "@angular/core";
import { GraphService } from "../../services/graph.service";
import { RepositoryService } from "../../services/repository.service";
import { switchToAddRepositoryPanel, displayAuthenticatePanel } from "../../misc/router";
import { createBranch, pushToRemote, pullFromRemote, cloneFromRemote, cleanRepo, requestLinkModal, Reload, Close, fetchFromOrigin } from "../../misc/git";
import { getOtherBranches } from "../../misc/repo";
import { cloneRepo } from "../../misc/authenticate";
import { AuthenticationService } from "../../services/authentication/authentication.service";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    providers: [RepositoryService, GraphService],
})

export class HeaderComponent {
    public repoName: string;
    public repoBranch: string;
    public repository: any;

    constructor(public authenticationService: AuthenticationService) {
        this.repoName = "Repo name";
        this.repoBranch = "Repo branch";
    }

    public switchToAuthenticatePanel(): void {
        displayAuthenticatePanel();
    }

    public promptUserToAddRepository(): void {
        switchToAddRepositoryPanel();
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
        cloneFromRemote();
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
