import { Component, ElementRef, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DiffService } from "../../services/diff-service/diff-service";
import { FileService } from "../../services/file.service";
import { displayDiffPanel, hideDiffPanel} from "../../misc/router";
import { RepositoryService } from "../../services/repository.service";
import { FileAndDiffPanelCommunicationService } from "../../services/inter-component-communication/file-and-diff-panel.communication.service"
import {AppModule} from "../../app.module";
import { ModifiedFile } from "../../modifiedFile";
import { Repository } from "nodegit";

const GREEN = "#84db00";
const RED = "#ff2448";
const Git = require("nodegit"); 
const path = require("path");
const readline = require("readline");
const fs = require("fs");

@Component({
    selector: "diff-panel",
    templateUrl: "./diff.panel.component.html",
})

export class DiffPanelComponent extends OnInit {
    public editing = false;
    repo: Repository;
    private selectedFilePath = "";

    @ViewChild("diffPanelContainer") public diffPanelContainer: ElementRef;
    @ViewChild("diffPanelBody") public diffPanelBody: ElementRef;

    constructor(
        public diffService: DiffService, 
        public fileService: FileService,
        private repositoryService: RepositoryService,
        private fileAndDiffPanelCommunicationService: FileAndDiffPanelCommunicationService) {super()}

    ngOnInit(): void {

        this.repo = this.repositoryService.currentRepo;

        // listens to file being selected from file panel 
        this.fileAndDiffPanelCommunicationService.modifiedFileSent$.subscribe(
            (modifiedFile) => {
                this.toggleDiffPanelForFile(modifiedFile);

            }
        );
    }


    public toggleDiffPanelForFile(modifiedFile: ModifiedFile){

        if (modifiedFile.isRepositoryOrFolder()) {
            hideDiffPanel();
            return;
        }

        const doc = this.diffPanelContainer.nativeElement as HTMLElement;

        const fullFilePath = path.join(this.repo.workdir(), modifiedFile.filePath);
        this.diffService.openFile(fullFilePath);
        const diffPanelBodyHTML = this.diffPanelBody.nativeElement as HTMLDivElement;
        diffPanelBodyHTML.innerHTML = "";

        this.selectedFilePath = modifiedFile.filePath;

        if (doc.style.width === "0px" || doc.style.width === "") {
            displayDiffPanel();
            this.printFile(modifiedFile);
        } else if ((doc.style.width === "40%") && (modifiedFile.filePath !== this.selectedFilePath)) {
            this.printFile(modifiedFile);
        } else {
            hideDiffPanel();
        }
    }

    private printFile(file: ModifiedFile) {
        if (file.fileModification == 'NEW') {
            this.printNewFile(file.filePath);
        } else {
            this.printFileDiff(file.filePath);
        }
    }

    private printNewFile(filePath) {
        const repoFullPath = this.repositoryService.savedRepoPath;
        const fileLocation = path.join(repoFullPath, filePath);

        const lineReader = readline.createInterface({
            input: fs.createReadStream(fileLocation),
        });
        let lineNumber = 0;

        lineReader.on("line", (line) => {
            lineNumber++;
            this.formatLine(lineNumber + "\t" + line, true);
        });
    }

    private async printFileDiff(filePath) {
        // relative to head commit if commit argument not specified 
        this.diffService.getLineChangesForFile(this.repo.path(), filePath, (lineDiffObj) => {
            let diffLineString = this.formatDiffLineToString(lineDiffObj.origin, lineDiffObj.lineNumber, lineDiffObj.content)
            this.formatLine(diffLineString, false);
           
        });
    }


    private formatLine(line: string, isNewFile: boolean) {
        const element = document.createElement("div");

        if (isNewFile) {
            element.style.backgroundColor = GREEN;
        } else {
            if (line.charAt(0) === "+") {
                element.style.backgroundColor = GREEN;
            } else if (line.charAt(0) === "-") {
                element.style.backgroundColor = RED;
            }
            line = line.slice(1, line.length);
        }
    
        element.innerText = line;
        const diffPanelBodyHTML = this.diffPanelBody.nativeElement as HTMLDivElement;
        diffPanelBodyHTML.appendChild(element);
    }

    private formatDiffLineToString(origin, lineNo, lineContent): string {
        let originCode = String.fromCharCode(origin);

        // Converts DiffLine into a string with format < [origin] [oldLineNumber] [newLineNumber] [Content] >
        // Uses tabs to keep spacing consistent
        if (originCode === "-") {
            return (String.fromCharCode(origin) + lineNo + "\t\t"  + lineContent);
        }
        else if (originCode === "+") {
            return (String.fromCharCode(origin) + "\t" + lineNo + "\t" + lineContent);
        }
        else if (originCode === " ") {
            return (String.fromCharCode(origin) + lineNo + "\t" + lineNo + "\t" + lineContent);
        }
        else {
            return (String.fromCharCode(origin) + lineContent);
        }
    }

    public cancelEdit(): void {
        this.editing = false;
        hideDiffPanel();
    }

    public editFile = (): void => {
        this.editing = true;
    }

}
