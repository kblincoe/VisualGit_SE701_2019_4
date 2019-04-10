import { Injectable } from "@angular/core";
import { Repository, Reference, Cred } from "nodegit"
import { resolve } from "path";

// Used for updating modal, remove this import after refactoring repo.ts
import { updateModalText, resetCloneProgress, transferCloneProgress, closeBar } from "../misc/repo";

let Git = require("nodegit");
let fs = require("fs-extra");
let path = require("path");
let readFile = require("fs-sync");

require("bootstrap");

@Injectable()
/**
 * This class should act as a service that operates on repositories, decoupling components from any 
 * repository handling functionality.
 */
export class RepositoryService {
    public savedRepoPath: string = "";
    public remoteName: string[] = [];
    public localBranches: string[] = [];
    public branchRefs = {};
    public remoteRefs = {};
    public branchCommit = [];
    /* Current repo is cached so that we don't need to open it again in other functions. */
    public currentRepo: Repository = null;
    public currentRepoName: string = "";

    public getCurrentRepo(): Repository {
        return this.currentRepo;
    }

    /**
     * Resets the repo service so it can be replaced by new repo information.
     */
    private resetRepoService(): void {
        this.savedRepoPath = "";
        this.localBranches = [];
        this.branchRefs = {};
        this.remoteRefs = {};
        this.branchCommit = [];
        this.currentRepoName = "";
    }

    /**
     * Downloads a repository.
     * @param cloneUrl The url of the repo.
     * @param savePath The local path in which the repo is saved.
     */
    public downloadRepository(cloneUrl: string, savePath: string, creds: Cred): Promise<Repository> {
        return new Promise((resolve, reject) => {

            resetCloneProgress()

            // Setting up options of clone.
            const options = {
                fetchOpts: {
                    callbacks: {
                        // Setting certificate check to return 0 to bypass certificate check.
                        certificateCheck: () => 0,
                        transferProgress: (stats) => { transferCloneProgress(stats) },
                        credentials: () => creds,
                    },
                },
            };

            Git.Clone(cloneUrl, savePath, options)
                .then((repository) => {
                    closeBar()
                    this.resetRepoService();
                    this.savedRepoPath = savePath;
                    this.currentRepo = repository;
                    resolve(repository);
                    // refreshAll(repository);
                }).catch((err) => {
                    closeBar()
                    reject(err);
                });
        });
    }

    /**
     * Opens a repository and sets the fields of the service.
     * @param filePath the local file path of the Git repository.
     */
    public openRepository(filePath: string): Promise<Repository> {
        return new Promise((resolve, reject) => {

            if (!readFile.exists(filePath)) {
                reject("Invalid file path.");
            }

            Git.Repository.open(filePath)
                .then((repo) => {
                    this.resetRepoService();
                    this.savedRepoPath = filePath;
                    this.currentRepo = repo;
                    resolve(repo);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public refreshRepo(): Promise<Repository> {
        return this.openRepository(this.savedRepoPath);
    }

    /**
     * Retrieves the current branch name.
     */
    public getCurrentBranchName(): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            if (this.currentRepo === null) {
                reject("Error no current repo");
            }
            this.currentRepo.getCurrentBranch()
                .then((branchRef) => {
                    resolve(this.extractBranchName(branchRef));
                })
                .catch((err) => {
                    reject(err);
                })
        })
    }

    /**
     * Refreshes the branches by updating all branch names.
     */
    public refreshBranches(): Promise<{}> {
        // Gets current branch
        return new Promise<{}>((resolve, reject) => {
            let branches = { 'local': [], 'remote': [] };
            this.currentRepo.getReferences(Git.Reference.TYPE.LISTALL)
                .then((branchList) => {
                    // Add all branches to a dictionary.
                    for (let i = 0; i < branchList.length; i++) {
                        const branchName = this.extractBranchName(branchList[i]);

                        if (branchList[i].isRemote()) {
                            if (!this.localBranches.includes(branchName)) {
                                branches['remote'].push(branchName);
                            }
                        } else {
                            this.localBranches.push(branchName);
                            branches['local'].push(branchName);
                        }

                        // Resetting branch refs before refrshing all the references.
                        // In the future could probably optimize this just to detect differences and append those.
                        this.branchRefs = [];
                        this.addCommitIds(branchList[i])
                    }

                    resolve(branches);
                })
                .catch((err) => {
                    reject(err);
                })
        })

    }

    /**
     * Retrieves the names of all other branches apart from the current branch.
     */
    public getOtherBranches(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let currentBranch;

            this.currentRepo.getCurrentBranch()
                .then((ref) => {
                    currentBranch = this.extractBranchName(ref);
                    return this.currentRepo.getReferenceNames(Git.Reference.TYPE.LISTALL);
                })
                .then((branchRefs) => {
                    // Returns all branch names other than current branch.
                    const relevantBranchNames = branchRefs.reduce((relevantBranches, ref) => {
                        const branchName = this.extractBranchName(ref);
                        if (!ref.isRemote() && branchName !== currentBranch) {
                            relevantBranches.push(branchName);
                        }
                    }, [])

                    resolve(relevantBranchNames);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    /**
     * Helper function to extract branch name.
     * @param branchRef 
     */
    private extractBranchName(branchRef: Reference): string {
        const splitChar = '/';
        return branchRef.name().split(splitChar).pop();
    }

    /**
     * Adds the commit ids of each branch to the internal branchRefs data structure.
     * @param branchRef the reference for the branch.
     */
    private addCommitIds(branchRef: Reference) {
        // Since the repo is refreshed, the branch refs are also reset.
        const branchName = this.extractBranchName(branchRef)
        Git.Reference.nameToId(this.currentRepo, branchRef.name())
            .then(function (id) {
                if (branchRef.isRemote()) {
                    this.remoteRefs[branchName] = id;
                } else {
                    this.branchCommit.push(branchRef);
                    console.log(branchName + "--------" + id.tostrS());
                    if (id.tostrS() in this.branchRefs) {
                        this.branchRefs[id.tostrS()].push(branchRef);
                    } else {
                        this.branchRefs[id.tostrS()] = [branchRef];
                    }
                }
            });
    }

    public createRepo(fullPath: string): void {
        const fileNames = [".gitignore", "README.md"];
        const fileContent = "";
        const isBare = 0;
        let repository;
        let index;

        updateModalText("Creating a new repository...");
        fs.ensureDir(path.resolve(fullPath))
            .then(function () {
                return Git.Repository.init(path.resolve(fullPath), isBare);
            })
            .then(function (repo) {
                repository = repo;
                return Promise.all(fileNames.map(function (fileName: string) {
                    fs.writeFile(
                        path.join(repo.workdir(), fileName), fileContent);
                }));
            })
            .then(function () {
                return repository.refreshIndex();
            })
            .then(function (idx) {
                index = idx;
            })
            .then(function () {
                return index.addAll();
            })
            .then(function () {
                return index.write();
            })
            .then(function () {
                return index.writeTree();
            })
            .then(function (oid) {
                const author = repository.defaultSignature();
                const committer = repository.defaultSignature();

                // Since we're creating an inital commit, it has no parents. Note that unlike
                // normal we don't get the head either, because there isn't one yet.
                return repository.createCommit("HEAD", author, committer, "message", oid, []);
            })
            .then(function () {
                updateModalText("Created a new repository successfully");
            })
            .catch(function (err) {
                updateModalText("Failed: " + err);
                console.log("repository.service.ts, Line 68. Error is: " + err);
            });
    }
    /**
     * TODO Checks out local branch on local repo.
     * @param branchName name of branch to checkout into.
     */
    public checkoutLocalBranch(branchName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const headPrefix = "refs/heads/"
            this.currentRepo.checkoutBranch(headPrefix + branchName)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        })
    }

    /**
     * The following is currently not implemented and are templates of the old function,
     */

    // public checkoutRemoteBranch(branchName: string): Promise<void> {
    //     return new Promise ((resolve, reject) => {
    //         console.log("1.0  " + branchName);
    //         const cid = this.remoteRefs[branchName];
    //         git.Commit.lookup(this.currentRepo, cid)
    //             .then((commit) => {
    //                 console.log("3.0");
    //                 return git.Branch.create(this.currentRepo, branchName, commit, 0);
    //             })
    //             .then((code) => {
    //                 console.log(bn + "PPPPPPP");
    //                 repos.mergeBranches(bn, "origin/" + bn)
    //                     .then(function () {
    //                         refreshAll(repos);
    //                         console.log("Pull successful");
    //                     });
    //             })
    //             .catch((err) => {
    //                 console.log(err)
    //                 reject(err)
    //             })
    //     })

}
