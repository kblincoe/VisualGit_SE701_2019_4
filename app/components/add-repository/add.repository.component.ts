import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { openRepository, downloadRepository } from "../../misc/repo";
import { switchToMainPanel } from "../../misc/router";

@Component({
    selector: "add-repository-panel",
    templateUrl: "./add.repository.component.html",
})

export class AddRepositoryComponent {

    @ViewChild("dirPickerSaveNew") private fullPathInput: ElementRef;
    cloneURL: string;
    saveDirectory: string;

    public addRepository(): void {
        downloadRepository();
        switchToMainPanel();
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
        let localPath = fullPath.replace(process.cwd(), "");
        this.saveDirectory = localPath;
    }

    public setPresetPath(): void {
        const text = this.cloneURL;
        const splitText = text.split(/\.|:|\//);
        if (splitText.length >= 2) {
            this.saveDirectory = splitText[splitText.length - 2];
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
        switchToMainPanel();
    }

    public returnToMainPanel(): void {
        switchToMainPanel();
    }
}
