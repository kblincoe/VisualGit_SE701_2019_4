import { Component } from "@angular/core";
import { cancelEdit, saveFile } from "../../misc/file";
import { DiffService } from "../../services/diff-service/diff-service";

@Component({
    selector: "diff-panel",
    templateUrl: "./diff.panel.component.html",
})

export class DiffPanelComponent {
    public editing = false;

    constructor(public diffService: DiffService) {

    }

    public cancelEdit(): void {
        this.editing = false;
        cancelEdit();
    }

    public editFile = (): void => {
        this.editing = true;
    }

}
