import { Component } from "@angular/core";
import { openRepository, updateLocalPath, downloadRepository } from "../../misc/repo";
import { switchToMainPanel } from "../../misc/router";

@Component({
    selector: "add-repository-panel",
    templateUrl: "./add.repository.component.html",
})

export class AddRepositoryComponent {

    public addRepository(): void {
        downloadRepository();
        switchToMainPanel();
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

    public updateLocalPath() {
        updateLocalPath();
    }

    public openRepository(): void {
        openRepository();
        switchToMainPanel();
    }

    public returnToMainPanel(): void {
        switchToMainPanel();
    }
}
