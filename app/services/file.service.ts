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


    /* 
     To fix
     The purpose of this function is to update the file service's selected file 
     path state, since the diff panel component now partially handles showing/hiding
     the diff panel GUI itself. The logic for setting the selected file path is based 
     on toggleDiffPanel() method in diff.panel.component.ts
    */
   public setSelectedFilePath(modifiedFile: ModifiedFile) {
        const doc = document.getElementById("diff-panel");
        
        if (doc.style.width === "0px" || 
            doc.style.width === "" || 
            ((doc.style.width === "40%") && (modifiedFile.filePath !== this.selectedFilePath))) {
                this.selectedFilePath = modifiedFile.filePath;
        }
    }
    
}
