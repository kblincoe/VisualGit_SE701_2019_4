import {RepositoryService} from "./repository.service";
import {Injectable} from '@angular/core';
import {ModifiedFile} from "../modifiedFile";
import {displayDiffPanel, hideDiffPanel} from "../misc/router";
import {BehaviorSubject} from "rxjs";
import {AuthUtils} from "../misc/authenticate";
import {calculateModification} from "../misc/git";
import {DiffService} from "./diff-service/diff-service";
import {AppModule} from "../app.module";

const path = require("path");
const Git = require("nodegit");
const $ = require("jquery");
const green = "#84db00";
const fs = require("fs");

export let modifiedFilesLength = 0;

@Injectable()
export class FileService {

    modifiedFiles: BehaviorSubject<ModifiedFile[]> = new BehaviorSubject<ModifiedFile[]>([]);
    repo;
    selectedFilePath = "";

    constructor(private diffService: DiffService) { }

    public updateModifiedFiles(): void {
        const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
        Git.Repository.open(repoFullPath)
            .then( (repo) => {

                    this.repo = repo;

                    repo.getStatus().then( (statuses) => {

                        let files = [];

                        console.log("Update modified files status");
                        for (let fileStatus of statuses){
                            const path = fileStatus.path();
                            const modification = calculateModification(fileStatus);
                            files.push(new ModifiedFile(path, modification, false));
                        }

                        modifiedFilesLength = files.length;
                        if (modifiedFilesLength > 0){
                            window.onbeforeunload = FileService.modalConfirmation;
                            AuthUtils.changes = 1;
                        }

                        this.modifiedFiles.next(files);

                        if (!files.some(file => file.filePath == this.selectedFilePath)){
                            hideDiffPanel();
                        }
                    });
                },
                function (err) {
                    console.log("waiting for repo to be initialised");
                });
    }

    static modalConfirmation() {
        $("#modalW").modal();
        return "modalW showing";
    }

    public cancelEdit() {
        hideDiffPanel();
    }
    

    public toggleDiffPanel(modifiedFile: ModifiedFile){
        // If the ModifiedFile is a git repository/folder,
        // close any open diff panels and do not open one for the folder.
        const lastChar = modifiedFile.filePath.split("").pop();
        if ( lastChar == "\\" ||  lastChar == "/") {
            hideDiffPanel();
            return;
        }
        const doc = document.getElementById("diff-panel");
        const fullFilePath = path.join(this.repo.workdir(), modifiedFile.filePath);
        if (doc.style.width === "0px" || doc.style.width === "") {
            this.diffService.openFile(fullFilePath);
            displayDiffPanel();
            document.getElementById("diff-panel-body").innerHTML = "";
            if (modifiedFile.fileModification == 'NEW') {
                this.selectedFilePath = modifiedFile.filePath;
                this.printNewFile(modifiedFile.filePath);
            } else {
                this.selectedFilePath = modifiedFile.filePath;
                this.printFileDiff(modifiedFile.filePath);
            }
        } else if ((doc.style.width === "40%") && (modifiedFile.filePath !== this.selectedFilePath)) {
            this.diffService.openFile(fullFilePath);
            document.getElementById("diff-panel-body").innerHTML = "";
            if (modifiedFile.fileModification == 'NEW') {
                this.selectedFilePath = modifiedFile.filePath;
                this.printNewFile(modifiedFile.filePath);
            } else {
                this.selectedFilePath = modifiedFile.filePath;
                this.printFileDiff(modifiedFile.filePath);
            }
        } else {
            hideDiffPanel();
        }
    }

    private printNewFile(filePath) {
        const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
        const fileLocation = require("path").join(repoFullPath, filePath);
        const lineReader = require("readline").createInterface({
            input: fs.createReadStream(fileLocation),
        });

        lineReader.on("line", (line) => {
            this.formatNewFileLine(line);
        });
    }

    private printFileDiff(filePath) {
        this.repo.getHeadCommit().then((commit) => {
            this.getCurrentDiff(commit, filePath, (line) => {
                this.formatLine(line);
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
                                    const oldFilePath = patch.oldFile().path();
                                    const newFilePath = patch.newFile().path();
                                    if (newFilePath === filePath) {
                                        lines.forEach((line) => {
                                            callback(String.fromCharCode(line.origin()) + line.content());
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

    private formatLine(line) {
        const element = document.createElement("div");

        if (line.charAt(0) === "+") {
            element.style.backgroundColor = "#84db00";
            line = line.slice(1, line.length);
        } else if (line.charAt(0) === "-") {
            element.style.backgroundColor = "#ff2448";
            line = line.slice(1, line.length);
        }

        element.innerText = line;
        document.getElementById("diff-panel-body").appendChild(element);
    }

    private formatNewFileLine(text) {
        const element = document.createElement("div");
        element.style.backgroundColor = green;
        element.innerText = text;
        document.getElementById("diff-panel-body").appendChild(element);
    }

}
