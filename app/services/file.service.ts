import {RepositoryService} from "./repository.service";
import {Injectable} from '@angular/core';
import {ModifiedFile} from "../modifiedFile";
import {displayDiffPanel, hideDiffPanel} from "../misc/router";
import {calculateModification} from "../misc/git";
import {DiffService} from "./diff-service/diff-service";
import {AppModule} from "../app.module";

const GREEN = "#84db00";
const RED = "#ff2448";

const path = require("path");
const readline = require("readline");
const Git = require("nodegit");
const fs = require("fs");

@Injectable()
export class FileService {

    private repo;
    private selectedFilePath = "";
    public modifiedFilesLength = 0;

    constructor(private diffService: DiffService) { }

    public getModifiedFilesPromise(): Promise<ModifiedFile[]> {
        const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;

        return Git.Repository.open(repoFullPath).then( (repo) => {
            
            this.repo = repo;

            return repo.getStatus().then( (statuses) => {

                let files: ModifiedFile[] = [];

                console.log("Update modified files status");
                for (let fileStatus of statuses){
                    const path = fileStatus.path();
                    const modification = calculateModification(fileStatus);
                    files.push(new ModifiedFile(path, modification, false));
                }

                this.modifiedFilesLength = files.length;
                
                if (!files.some(file => file.filePath == this.selectedFilePath)){
                    hideDiffPanel();
                }
                
                return files;
            });
        },

        function (err) {
            console.log("waiting for repo to be initialised");
            return undefined;
        });

    }

    // being decoupled from in a new PR
    public cancelEdit() {
        hideDiffPanel();
    }

    public toggleDiffPanelForFile(modifiedFile: ModifiedFile){

        if (modifiedFile.isRepositoryOrFolder()) {
            hideDiffPanel();
            return;
        }

        const doc = document.getElementById("diff-panel");
        const fullFilePath = path.join(this.repo.workdir(), modifiedFile.filePath);

        this.diffService.openFile(fullFilePath);
        document.getElementById("diff-panel-body").innerHTML = "";
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
        document.getElementById("diff-panel-body").appendChild(element);
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

}
