import { Component } from "@angular/core";
import { DiffService } from "../../services/diff-service/diff-service";
import { FileService } from "../../services/file.service";

@Component({
    selector: "diff-panel",
    templateUrl: "./diff.panel.component.html",
})

export class DiffPanelComponent {
    public editing = false;

    constructor(public diffService: DiffService, public fileService: FileService) {

    }

    public cancelEdit(): void {
        this.editing = false;
        this.fileService.cancelEdit();
    }

    public editFile = (): void => {
        this.editing = true;
    }

}
