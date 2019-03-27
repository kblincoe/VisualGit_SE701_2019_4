import { Component } from "@angular/core";
import { setAllCheckboxes } from "../misc/checkbox";

@Component({
    selector: "file-panel",
    template: `
  <div class="file-panel" id="file-panel">

    <div class="modified-files-header" id="modified-files-header">
      <p class="select-all-message" id="select-all-message">Select all</p>
      <input #checkbox (click)="setAllCheckboxes(checkbox);" type="checkbox" class="select-all-checkbox" id="select-all-checkbox"/>
    </div>

    <div class="files-changed" id="files-changed">
      <p class="modified-files-message" id="modified-files-message">Your modified files will appear here</p>
      <div class="file" *ngFor="let file of files">
        <p>{{file}}</p>
      </div>
    </div>

    <div class="commit-panel" id="commit-panel">
      <textarea placeholder="Describe your changes here..." class="commit-message-input" id="commit-message-input"></textarea>
      <button class="commit-button" id="commit-button">Commit</button>
    </div>

  </div>
  `,
})

export class FilePanelComponent {
    public setAllCheckboxes(checkbox: HTMLInputElement) {
        setAllCheckboxes(checkbox);
    }
}
