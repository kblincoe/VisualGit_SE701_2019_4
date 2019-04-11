import { Component } from "@angular/core";
import { RepositoryService } from "../../services/repository.service";
import { PopupService} from "../../services/popup/popup.service"
import { createBranch, pushToRemote, pullFromRemote, cleanRepo, requestLinkModal, Reload, Close, fetchFromOrigin } from "../../misc/git";
import { cloneRepo } from "../../misc/authenticate";
import { Router } from "@angular/router";
import { UserService } from "../../services/user/user.service";
import { displayModal, clearMergeElement, clearBranchElement, displayBranch } from "../../misc/repo";
import { addCommand } from "../../misc/gitCommands";
import { FileService } from "../../services/file.service";
import { PopupStyles } from "../popup/popup.component";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
})

export class HeaderComponent {
    
    public repoName: string;
    public repoBranch: string;
    public repository: any;
    public remotes: string[];
    private remoteName: string;
    private remoteURL: string;
        
    constructor(public userService: UserService, 
                private router: Router,
                public repoService: RepositoryService,
                private fileService: FileService,
                private popupService: PopupService) {
        this.repoName = "Repo name";
        this.repoBranch = "Repo branch";
    }

    public switchToAuthenticatePanel(): void {
        // Commenting this code temporarily since #242 is blocking this.
        // if (this.fileService.areFilesModified()){
        //     displayModal("Warning: Please commit before signing out.");
        // } else {
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
        const warningMessage = "Please make sure commits are pushed, if you don't want to lose progress!";
        this.popupService.showInfo(warningMessage, PopupStyles.Error);
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
        this.router.navigate(['/panel/repository/add']);
    }

    public cleanRepo(): void {
        cleanRepo();
    }

    public requestLinkModal(): void {
        requestLinkModal();
    }

    public getOtherBranches(): void {
        this.repoService.getOtherBranches()
            .then((branchNames) => {
                clearMergeElement();
                clearBranchElement();
                branchNames.forEach((name) => {
                    // "mergeLocalBranches(this)"" is supposed to be passed as the final 
                    // argument, but it is currently not in the scope of this file.
                    displayBranch(name, "merge-dropdown", "");
                })
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * This function will be completed in a separate PR
     */
    public checkoutLocalBranch(element: any): void {
        let bn
        if (typeof element === "string") {
            bn = element;
        } else {
            bn = element.innerHTML;
        }

        //TODO: use repo service to checkout local branch, same for remote branch
    }

    /**
     * This function retrieves all the remotes and stores them.
     */
    public getAllRemotes() {
        this.repoService.getAllRemotes()
        .then((remotes) => {
            this.remotes = remotes;
        })
        .catch((err) => {
            console.log(err);
        });
    }

    /**
     * This function adds a remote to the repository given a remote name and url.
     */
    public addRemote() {
        if (this.remoteName == null || this.remoteName == "" || this.remoteURL == null || this.remoteURL == "") {
            // If remote and/or url not specified, display modal
            const warningMessage = "Please specify a remote name and url"
            this.popupService.showInfo(warningMessage, PopupStyles.Error)
        } else {
            // If remote name and url specified, continue as normal
            this.repoService.addRemote(this.remoteName, this.remoteURL)
                .then((remoteName: string) => {
                    let successMessage = "Added " + remoteName + " successfully..."
                    this.popupService.showInfo(successMessage, PopupStyles.Info)
                    this.remoteName = "";
                    this.remoteURL = "";
                    this.getAllRemotes();
                })
                
        }
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
