import { Injectable } from "@angular/core";
import { Repository, Commit } from "nodegit"
import { RepositoryService } from "../repository.service";
import {AppModule} from "../../app.module";


const Git = require("nodegit");

@Injectable()
export class DiffService {

    private currentFile: string;


    public get CurrentFile() {
        return this.currentFile;
    }

    public openFile = (fileLocation: string) => {
        this.currentFile = fileLocation;
    }

    constructor() {}

    public getPatches(repository: Repository, callback): void {
        repository.getHeadCommit().then((commit) => {
            return commit.getTree();
        }).then((tree) => {
            return Git.Diff.treeToWorkdir(repository, tree, null);
        }).then((diff) => {
            return diff.patches();
        }).then((patches) => {
            return callback(patches);
        }).catch(console.error);
    }

    /**
        Method to get the full previous text of a file for a given commit, 
        (if commit not specified, it will use the latest commit if it exists).
        Returned is a raw string containing the content of the file (not seperated by new line characters). 
    */
    public async getFileContent(repoFullPath: string, filePath: string, commitHash?: string): string {

        let fileContentString = "";

        fileContentString = await Git.Repository.open(repoFullPath)
            .then(repo => new Promise(function(resolve, reject) {
                this.currentRepo = repo; 
                if (typeof commitHash !== 'undefined') {
                    // if we specified a commit to get the diff relative to 
                    resolve(Git.Commit.lookup(repo, commitHash));
                }
                // otherwise we look at the diff relative to the latest/previous commit 
                resolve(repo.getHeadCommit()); 
            }))
            .then(commit => {
                return commit.getEntry(filePath);
            })
            .then(entry => {
                if (!entry.isFile()) {
                    throw new Error("Entry specified is not a file")
                }
                return entry.getBlob();
            })
            .then(blob => {
                fileContentString = blob.toString();
            })
            .catch(error => {
                console.error("DiffService.getFileContent() error: ", error);
            });
        
        return fileContentString;
    }

    /**  
        Method to get the author of each line in a file (for the previous commit) or any specific commit.
        Returned is an array of the objects of the following structure:
        {
            line: number
            author: string
        }
    */
    public getAuthorAndLineBlame(repoFullPath: string, filename: string, callback, oldestCommitHash?: string, newestCommitHash?: string) {

        Git.Repository.open(repoFullPath)
            .then(function(repo) {
                let blameOptions = new Git.BlameOptions();
                
                if (typeof oldestCommitHash !== 'undefined') { 
                    // default is the very first commit in history, otherwise we specify as follows 
                    blameOptions.oldestCommit = Git.Oid.fromString(oldestCommitHash);
                }
                if (typeof newestCommitHash !== 'undefined') {
                     // default is the most recent commit (i.e. HEAD), otherwise we specify as follows 
                    blameOptions.newestCommit = Git.Oid.fromString(newestCommitHash);
                }
                return Git.Blame.file(repo, filename, blameOptions);
            })
            .then(function(blame) {
                let hunkCount = blame.getHunkCount();

                if (hunkCount != 0) {
                    let lineNum = 1;
                    for (let i = 0; i < hunkCount; i++) {
                        let hunk = blame.getHunkByIndex(i);
                        for (let j = 0; j < hunk.linesInHunk(); j++) {
                            let author = hunk.finalSignature.name; 
                            callback(
                                {
                                    lineNum: lineNum, 
                                    author: author 
                                }
                            )
                            lineNum++;
                        }
                    }
                }
            })
            .catch(function(error) {
                console.error("DiffService.getAuthorAndLineBlame() error: ", error);
            });
    }

}
