import { Component } from "@angular/core";
import { setAllCheckboxes } from "../../misc/checkbox";

@Component({
    selector: "file-panel",
    templateUrl: "./file.panel.component.html",
})

export class FilePanelComponent {
    public setAllCheckboxes(checkbox: HTMLInputElement) {
        setAllCheckboxes(checkbox);
    }
}
