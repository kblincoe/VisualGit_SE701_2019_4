import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { openRepository, downloadRepository } from "../../misc/repo";
import { Router } from "@angular/router";
import { ThemeService } from "../../services/theme.service";

import * as path from "path"

@Component({
    selector: "add-repository-panel",
    templateUrl: "./add.repository.component.html",
})

export class AddRepositoryComponent implements OnInit {

    @ViewChild("dirPickerSaveNew") private fullPathInput: ElementRef;
    cloneURL: string;
    saveDirectory: string;

    constructor(private router: Router, private themeService: ThemeService) {}

    ngOnInit() {
        this.themeService.setColors();
    }

    public addRepository(): void {
        downloadRepository();
        this.router.navigate(['/panel/main']);
    }


    // Opens up directory select, to chooose where to clone the repository
    public selectSavePath(): void {
        let dirPicker = this.fullPathInput.nativeElement;
        dirPicker.value = ""; // Resets dirPickerSaveNew before each selecting a new directory, so it can trigger (change).
        dirPicker.click();
    }

    // Once a (local) directory has been selected, updates the input field to represent the local path
    public setSavePath(): void {
        let fullPath = this.fullPathInput.nativeElement.files[0].path;
        this.saveDirectory = fullPath;
    }

    public setPresetPath(): void {
        const text = this.cloneURL;
        const splitText = text.split(/\.|:|\//);
        if (splitText.length >= 2) {
            let newFolderName = splitText[splitText.length - 2];
            this.saveDirectory = path.join(__dirname, newFolderName);
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

    public openRepository(): void {
        openRepository();
        this.router.navigate(['/panel/main']);
    }

    public returnToMainPanel(): void {
        this.router.navigate(['/panel/main']);
    }
}
