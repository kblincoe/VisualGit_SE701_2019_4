import { Component, ElementRef, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DiffService } from "../../services/diff-service/diff-service";
import { FileService } from "../../services/file.service";
import { displayDiffPanel, hideDiffPanel} from "../../misc/router";
import { RepositoryService } from "../../services/repository.service";
import { FileAndDiffPanelCommunicationService } from "../../services/inter-component-communication/file-and-diff-panel.communication.service"
import { AppModule } from "../../app.module";
import { ModifiedFile } from "../../modifiedFile";
import { Repository } from "nodegit";
import { Interface } from "readline";

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

    private getLineReader(filePath: string): Interface {
        const repoFullPath = this.repositoryService.savedRepoPath;
        const fileLocation = path.join(repoFullPath, filePath);

        return readline.createInterface({
            input: fs.createReadStream(fileLocation),
        });
    }

    private getFileLines(filePath: string, lineStart: number, lineEnd: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let lineNo: number = 1;
            let lines: string[] = [];
            let resolved: boolean = false;
            let reader = this.getLineReader(filePath);
            reader.on("close", () => {
                if (!resolved) {
                    resolve(lines);
                }
            });
            reader.on("line", (line) => {
                if (resolved) {
                    return;
                }

                if (lineNo >= lineStart && lineNo <= lineEnd) {
                    lines.push(line);
                }

                if (lineNo >= lineEnd) {
                    resolve(lines);
                    resolved = true;
                }

                lineNo++;
            });
        });
    }

    private printNewFile(filePath: string) {
        let lineNumber = 0;

        this.getLineReader(filePath).on("line", (line) => {
            lineNumber++;
            this.insertNewFileLine(lineNumber + "\t" + line, true);
        });
    }

    private printFileDiff(filePath: string) {
        this.diffService.getPatches(this.repo, async (patches) => {
            for (let patch of patches) {
                const newFilePath = patch.newFile().path();
                if (newFilePath !== filePath) {
                    continue;
                }

                await patch.hunks().then(async (hunks) => {
                    for (let hunk of hunks) {
                        this.insertFileExpander(filePath, hunk, true);
                        await this.insertHunkDiff(hunk);
                        this.insertFileExpander(filePath, hunk, false);
                    }
                });
            }
        });
    }

    private insertFileExpander(filePath: string, hunk, above: boolean) {
        const expander = document.createElement("div");
        expander.className = "expander";
        expander.innerText = `Expand ${above ? 'Above' : 'Below'}`;
        const diffPanelBodyHTML = this.diffPanelBody.nativeElement as HTMLDivElement;
        diffPanelBodyHTML.appendChild(expander);

        if (above) {
            expander.dataset.lineNo = hunk.newStart() - 1;
        } else {
            expander.dataset.lineNo = hunk.newStart() + hunk.newLines();
        }

        expander.addEventListener("click", async (e) => {
            const linesToExpand: number = 10;

            // Determine which lines to load
            let lineNo: number = parseInt(expander.dataset.lineNo);
            let lineStart: number = lineNo + (above ? -linesToExpand : 0);
            let lineEnd: number = lineNo + (above ? 0 : linesToExpand);
            lineStart = Math.max(0, lineStart);

            let sibling: HTMLElement = above ? expander.previousSibling : expander.nextSibling;
            let hasHunkCollision: boolean = checkHunkCollision();

            // Read the lines from the file
            const lines: string[] = await this.getFileLines(filePath, lineStart, lineEnd);

            if (lines.length === 0) {
                removeExpander();
                return;
            }

            this.insertExpansionLines(expander, lineStart, lineEnd, lines, above);

            if (hasHunkCollision) {
                removeExpander();
            }

            function checkHunkCollision(): boolean {
                // Check whether we've intruded into a seperate hunk
                if (sibling != null && sibling.className === "expander") {
                    let siblingLineNo = parseInt(sibling.dataset.lineNo);
                    if (above) {
                        if (lineStart < siblingLineNo) {
                            lineStart = siblingLineNo;
                            return true;
                        }
                    } else if (lineEnd > siblingLineNo) {
                        lineEnd = siblingLineNo;
                        return true;
                    }
                }
                return false;
            }

            function removeExpander(): void {
                if (sibling != null && sibling.className === "expander") {
                    sibling.parentNode.removeChild(sibling);
                }
                expander.parentNode.removeChild(expander);
            }
        });
    }

    private insertExpansionLines(expander: HTMLElement, lineStart: number, lineEnd: number, lines: string[], above: boolean) {
        let lineNo: number = parseInt(expander.dataset.lineNo);
        let prevLine: HTMLElement;

        if (above) {
            // The minus one is to "move to" the line before the ones we've inserted
            expander.dataset.lineNo = lineNo - lines.length - 1;
            prevLine = expander;
        } else {
            // The plus one is to "move to" the line after the ones we've inserted
            expander.dataset.lineNo = lineNo + lines.length + 1;
            prevLine = expander.previousSibling;
        }

        for (let i = 0; i < lines.length; i++) {
            let line: string = lines[i];

            let formatted: string = this.formatDiffLineToString(" ".charCodeAt(0), lineStart + i, line);

            let element: HTMLElement = this.createDiffLineElement(formatted);
            prevLine.parentNode.insertBefore(element, prevLine.nextSibling);
            prevLine = element;
        }
    }

    private async insertHunkDiff(hunk): Promise<void> {
        await hunk.lines().then((lines: string[]) => {
            lines.forEach((line: string) => {
                let lineOrigin = String.fromCharCode(line.origin());

                let lineNum: string;
                if (lineOrigin == "-" || lineOrigin == " ") {
                    lineNum = line.oldLineno();
                } else if (lineOrigin == "+") {
                    lineNum = line.newLineno();
                }

                let formatted = this.formatDiffLineToString(line.origin(), lineNum, line.content());
                this.insertNewFileLine(formatted);
            });
        });
    }

    private createDiffLineElement(line: string, isNewFile: boolean) {
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
        return element;
    }

    private insertNewFileLine(line: string, isNewFile: boolean) {
        let element: HTMLElement = this.createDiffLineElement(line, isNewFile);
        this.insertNewFileLineElement(element);
    }

    private insertNewFileLineElement(element: HTMLElement) {
        const diffPanelBodyHTML = this.diffPanelBody.nativeElement as HTMLDivElement;
        diffPanelBodyHTML.appendChild(element);
    }

    private formatDiffLineToString(origin, lineNo, lineContent): string {
        let originCode = String.fromCharCode(origin);

        // Converts DiffLine into a string with format < [origin] [oldLineNumber] [newLineNumber] [Content] >
        // Uses tabs to keep spacing consistent
        if (originCode === "-") {
            return originCode + lineNo + "\t\t"  + lineContent;
        }
        else if (originCode === "+") {
            return originCode + "\t" + lineNo + "\t" + lineContent;
        }
        else if (originCode === " ") {
            return originCode + lineNo + "\t" + lineNo + "\t" + lineContent;
        }
        else {
            return originCode + lineContent;
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
