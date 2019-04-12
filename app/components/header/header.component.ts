import { Component, ViewChild, ElementRef } from "@angular/core";
import { RepositoryService } from "../../services/repository.service";
import { PopupService } from "../../services/popup/popup.service"
import { createBranch, pushToRemote, pullFromRemote, cleanRepo, requestLinkModal, Reload, Close, fetchFromOrigin } from "../../misc/git";
import { Router } from "@angular/router";
import { UserService } from "../../services/user/user.service";
import { displayModal, clearMergeElement, clearBranchElement, displayBranch } from "../../misc/repo";
import { addCommand } from "../../misc/gitCommands";
import { FileService } from "../../services/file.service";
import { PopupStyles } from "../popup/popup.component";
import { RepositoryListItem } from "../../misc/RepositoryListitemInterface";
import { changeRepoName, changeBranchName } from "../../misc/repo"
const path = require("path")

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
})

export class HeaderComponent {
    @ViewChild("dirPicker") dirPicker: ElementRef;

    public repoName: string;
    public repoBranch: string;
    public repository: any;
    public remotes: string[];
    private remoteName: string;
    private remoteURL: string;
    public selectedRepoItem: RepositoryListItem = null;
        
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
        this.repoService.removeCachedRepo();
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
    public getAllRemotes(): void {
        this.repoService.getAllRemotes()
            .then((remotes) => {
                this.remotes = remotes;
            });
    }

    /**
     * This function adds a remote to the repository given a remote name and url.
     */
    public addRemote(): void {
        if (this.remoteName == null || this.remoteName == "" || this.remoteURL == null || this.remoteURL == "") {
            // If remote and/or url not specified, display modal
            const warningMessage = "Please specify a remote name and url"
            this.popupService.showInfo(warningMessage, PopupStyles.Error)
        } else {
            // If remote name and url specified, continue as normal
            this.repoService.addRemote(this.remoteName, this.remoteURL)
                .then((remoteName: string) => {
                    let successMessage = "Added " + remoteName + " successfully...";
                    this.popupService.showInfo(successMessage, PopupStyles.Info);
                    this.remoteName = "";
                    this.remoteURL = "";
                    this.getAllRemotes();
                })
                .catch((err) => {
                    const warningMessage = "Please select a repository before adding a remote";
                    this.popupService.showInfo(warningMessage, PopupStyles.Error);
                });

        }
    }

    /**
     * This function fetches from a given remote repository
     */
    public fetchFromRemotes(): void {
        this.repoService.fetchFromRemotes();
    }

    public Reload(): void {
        Reload();
    }

    public Close(): void {
        Close();
    }

    public cloneRepo() {
        // this.dirPicker.nativeElement.click();
        // Going to hard code the path for now since there were synchronisation issues when using the dirpicker
        const name = this.selectedRepoItem.name;
        const savePath = "." + path.sep + name;
        const cloneUrl = this.selectedRepoItem.clone_url;
        //TODO allow the users to choose clone path in the future.
        this.repoService.downloadRepository(cloneUrl, savePath, this.userService.credentials)
            .then((repo) => {
                this.repoName = this.repoService.savedRepoPath;
                this.repoService.refreshBranches();
                this.router.navigate(['/panel/main']);
                this.popupService.showInfo("Cloned repo successfully");
            })
            .catch((err) => {
                this.popupService.showInfo("Clone failed " + err, )
            })
    }

    public fetchFromOrigin(): void {
        fetchFromOrigin();
    }

    public selectRepo(repoItem):void {
        this.selectedRepoItem = repoItem;
    }

}
