import { Component } from "@angular/core";
import { cancelEdit, saveFile } from "../../misc/file";

@Component({
    selector: "diff-panel",
    templateUrl: "./diff.panel.component.html",
})

export class DiffPanelComponent {

    public editing = false;

    public cancelEdit(): void {
        this.editing = false;
        cancelEdit();
    }

    public editFile = (): void => {
        this.editing = true;
    }

}
