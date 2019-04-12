import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ThemeService } from "../../services/theme.service";
import { RepositoryService } from "../../services/repository.service"
import { UserService } from "../../services/user/user.service";
import { displayModal, updateModalText, displayBranch, changeRepoName, changeBranchName, loadingModal, loadingModalHide } from "../../misc/repo"
import { drawGraph } from "../../misc/graphSetup";

let path = require("path");

@Component({
    selector: "add-repository-panel",
    templateUrl: "./add.repository.component.html",
})

export class AddRepositoryComponent implements OnInit {

    @ViewChild("dirPickerSaveNew") private fullPathInput: ElementRef;
    @ViewChild("dirPickerSaveInit") private fullPathInitInput: ElementRef;
    @ViewChild("dirPickerOpenLocal") private fullPathInputLocal: ElementRef;

    cloneURL: string;
    repoName: string;
    saveDirectory: string;
    initDirectory: string;
    localURL: string;

    constructor(private router: Router, 
                private themeService: ThemeService, 
                private repoService: RepositoryService,
                private userService: UserService) {}

    ngOnInit() {
        this.themeService.setColors();
        this.localURL = "";
    }

    public addRepository(): void {
        displayModal("Cloning Repository...");
        const credentials = this.userService.credentials;
        this.repoService.downloadRepository(this.cloneURL, this.saveDirectory, credentials)
            .then((repo) => {
                updateModalText("Clone Successful, repository saved under: " + this.saveDirectory);
                this.router.navigate(['/panel/main']);
                this.repoService.refreshBranches();
            }).catch((err) => {
                updateModalText("Clone Failed - " + err);
                console.log(err)
            });
    }

    public createRepository(): void {
        this.repoService.createRepo(this.initDirectory);
        this.router.navigate(['/panel/main']);
    }

    public openRepository(): void {
        this.getLocalRepoPath()
        displayModal("Opening Local Repository and Generating Graph...");
        loadingModal();
        this.repoService.openRepository(this.localURL)
            .then((repo) => {
                this.router.navigate(['/panel/main']);
                this.repoService.refreshBranches();
            }).catch((err) => {
                updateModalText("Opening Failed - " + err);
                console.log(err)
            });
    }

    private getLocalRepoPath(): void {
        // Full path is determined by either handwritten directory or selected by file browser
        let fullLocalPath = this.localURL;

        if (fullLocalPath === null || fullLocalPath === "") {
            fullLocalPath = this.fullPathInputLocal.nativeElement.files[0].path;
            this.localURL = fullLocalPath;
        } 
    }

    // Opens up directory select, to choose where to clone the repository
    public selectSavePath(): void {
        const dirPicker = this.fullPathInput.nativeElement;
        dirPicker.value = ""; // Resets dirPickerSaveNew before each selecting a new directory, so it can trigger (change).
        dirPicker.click();
    }

    // Once a (local) directory has been selected, updates the input field to represent the local path
    public setSavePath(): void {
        const fullPath = this.fullPathInput.nativeElement.files[0].path;
        this.saveDirectory = fullPath;
    }

    public setPresetPath(): void {
        const text = this.cloneURL;
        const splitText = text.split(/\.|:|\//);
        if (splitText.length >= 2) {
            const newFolderName = splitText[splitText.length - 2];
            this.saveDirectory = path.join(__dirname, newFolderName);
        }
    }

    // Opens up directory finder, to select where to initialise the repository
    public selectInitPath(): void {
        const dirPicker = this.fullPathInitInput.nativeElement;
        dirPicker.value = "";
        dirPicker.click();
    }

    // Once a directory has been selected, updates the input field to represent the path
    public setInitPath(): void {
        const fullPath = this.fullPathInitInput.nativeElement.files[0].path;
        this.initDirectory = fullPath;
    }

    // Set a preset path when entering a repo name for git init 
    public setInitPresetPath(): void {
        const text = this.repoName;
        const newFolderName = text.replace(/\s+/g, '');
        this.initDirectory = path.join(__dirname, newFolderName);
    }

    public selectCreate(): void {
        if (this.initDirectory == null || this.initDirectory == "") {
            // If no directory specified, launch file browser
            this.selectInitPath();
        } else {
            // If directory is specified, continue as normal
            this.createRepository();
        }
    }

    // Add function that determines if directory written or not
    public selectSave(): void {
        if ((document.getElementById("repoSave") as HTMLInputElement).value == null || (document.getElementById("repoSave") as HTMLInputElement).value == "") {
            // If no directory specified, launch file browser
            document.getElementById("dirPickerSaveNew").click();
        } else {
            // If directory is specified, continue as normal
            this.addRepository();
        }
    }

    // Add function that determines if directory written or not
    public selectDirectory(): void {
        if ((document.getElementById("repoOpen") as HTMLInputElement).value == null || (document.getElementById("repoOpen") as HTMLInputElement).value == "") {
            // If no directory specified, launch file browser
            document.getElementById("dirPickerOpenLocal").click();
        } else {
            // If directory is specified, continue as normal
            this.openRepository();
        }
    }

    public returnToMainPanel(): void {
        this.router.navigate(['/panel/main']);
    }
    
}
