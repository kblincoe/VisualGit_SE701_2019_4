import { Component, OnInit, OnDestroy } from "@angular/core";
import { setAllCheckboxes } from "../../misc/checkbox";
import { addAndCommit, displayModifiedFiles } from "../../misc/git";

@Component({
    selector: "file-panel",
    templateUrl: "./file.panel.component.html",
})

export class FilePanelComponent implements OnInit, OnDestroy {

    private interval;

    ngOnInit() {
        // Update modified files on left file panel every X seconds
        this.interval = setInterval(function () {
            displayModifiedFiles();
        }, 3000);
        
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    public setAllCheckboxes(checkbox: HTMLInputElement) {
        setAllCheckboxes(checkbox);
    }

    public addAndCommit() {
        addAndCommit();
    }
}
