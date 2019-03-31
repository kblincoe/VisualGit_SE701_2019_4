import { Component } from "@angular/core";
import { cancelEdit, saveFile } from "../../misc/file";

@Component({
  selector: "diff-panel",
  templateUrl: "./diff.panel.component.html",
})

export class DiffPanelComponent {

  public saveFile(): void {
    saveFile();
  }

  public cancelEdit(): void {
    cancelEdit();
  }
}
