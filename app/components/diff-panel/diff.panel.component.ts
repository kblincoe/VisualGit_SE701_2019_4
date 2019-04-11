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
        const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
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

    private printFileDiff(filePath) {
        this.repo.getHeadCommit().then((commit) => {
            this.getCurrentDiff(commit, filePath, (line) => {
                this.formatLine(line, false);
            });
        });
    }

    private getCurrentDiff(commit, filePath, callback) {
        commit.getTree().then((tree) => {
            Git.Diff.treeToWorkdir(this.repo, tree, null).then((diff) => {
                diff.patches().then((patches) => {
                    patches.forEach((patch) => {
                        patch.hunks().then((hunks) => {
                            hunks.forEach((hunk) => {
                                hunk.lines().then((lines) => {
                                    const newFilePath = patch.newFile().path();
                                    if (newFilePath === filePath) {
                                        lines.forEach((line) => {
                                            callback(this.formatDiffLineToString(line));
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            });
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

    private formatDiffLineToString(line) {
        let originCode = String.fromCharCode(line.origin());

        // Converts DiffLine into a string with format < [origin] [oldLineNumber] [newLineNumber] [Content] >
        // Uses tabs to keep spacing consistent
        if (originCode === "-") {
            return (String.fromCharCode(line.origin()) + line.oldLineno() + "\t\t"  + line.content());
        }
        else if (originCode === "+") {
            return (String.fromCharCode(line.origin()) + "\t" + line.newLineno() + "\t" + line.content());
        }
        else if (originCode === " ") {
            return (String.fromCharCode(line.origin()) + line.oldLineno() + "\t" + line.newLineno() + "\t" + line.content());
        }
        else {
            return (String.fromCharCode(line.origin()) + line.content());
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
