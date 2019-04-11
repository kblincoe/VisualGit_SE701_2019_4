import { Component } from "@angular/core";
import { RepositoryService } from "../../services/repository.service";
import { createBranch, pushToRemote, pullFromRemote, cleanRepo, requestLinkModal, Reload, Close, fetchFromOrigin } from "../../misc/git";
import { cloneRepo } from "../../misc/authenticate";
import { Router } from "@angular/router";
import { UserService } from "../../services/user/user.service";
import { displayModal, clearMergeElement, clearBranchElement, displayBranch } from "../../misc/repo";
import { addCommand } from "../../misc/gitCommands";
import { FileService } from "../../services/file.service";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
})

export class HeaderComponent {
    
    public repoName: string;
    public repoBranch: string;
    public repository: any;
        
    constructor(public userService: UserService, 
                private router: Router,
                public repoService: RepositoryService,
                private fileService: FileService) {
        this.repoName = "Repo name";
        this.repoBranch = "Repo branch";
    }

    public switchToAuthenticatePanel(): void {
        if (this.fileService.areFilesModified()){
            displayModal("Warning: Please commit before signing out.");
        } else {
        this.router.navigate(['/']);
        }
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
