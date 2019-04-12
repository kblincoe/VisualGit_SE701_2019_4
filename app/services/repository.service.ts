import { Injectable } from "@angular/core";
import { Repository, Reference, Cred } from "nodegit"
import { resolve } from "path";

// Used for updating modal, remove this import after refactoring repo.ts
import { updateModalText, resetCloneProgress, transferCloneProgress, closeBar, changeRepoName, changeBranchName, displayBranch, clearBranchElement } from "../misc/repo";
import { drawGraph } from "../misc/graphSetup";
import { PopupStyles } from "../components/popup/popup.component";
import { PopupService } from "./popup/popup.service";
import { addCommand } from "../misc/gitCommands";
import { UserService } from "./user/user.service";
import { AppModule } from "../app.module";

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
    public remoteNames: string[] = [];
    public localBranches: string[] = [];
    public branchRefs = {};
    public remoteRefs = {};
    public branchCommit = [];
    /* Current repo is cached so that we don't need to open it again in other functions. */
    public currentRepo: Repository = null;
    public currentRepoName: string = "";

    constructor(private popupService: PopupService) {
    }

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
     * removeCachedRepo
     */
    public removeCachedRepo(): void {
        this.currentRepo = null;
    }

    /**
     * This function creates a new remote for a repository and return the remote name as a Promise.
     *  @param name The name of the new remote
     *  @param url The url of the remote repository
     */
    public addRemote(name: string, url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.createRepo != null) {
                Git.Remote.create(this.currentRepo, name, url)
                    .then((remote) => {
                        resolve(remote.name());
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                reject('No repository selected, please select a repository before adding a remote');
            }
        });
    }

    /**
     * This functions rerurns an array of remote names as a Promise.
     */
    public getAllRemotes(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.currentRepo.getRemotes()
                .then((remotes) => {
                    this.remoteNames = remotes;
                    resolve(remotes);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * fetchFromRemote
     */
    public fetchFromRemotes(): void {
        let repository;
        Git.enableThreadSafety();

        if (this.currentRepo != null) {
            Git.Repository.open(this.savedRepoPath)
                .then(function (repo) {
                    repository = repo;
                }).then(() => {
                    return Promise.all(this.remoteNames.map((remote) => {
                        repository.fetch(remote, {
                            callbacks: {
                                credentials: () => {
                                    return AppModule.injector.get(UserService).getCredentials();
                                },
                                certificateCheck: () => {
                                    return 0;
                                }
                            }
                        });
                    }));
                }).then(() => {
                    const successMessage = "Fetched all remote repositories successfully";
                    this.popupService.showInfo(successMessage, PopupStyles.Info);
                }).catch(() => {
                    const warningMessage = "Failed to fetch all remote repositories";
                    this.popupService.showInfo(warningMessage, PopupStyles.Error);
                });
        } else {
            const warningMessage = "Failed to fetch, please select a repository";
            this.popupService.showInfo(warningMessage, PopupStyles.Error);
        }
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
                .then(async (branchList) => {
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
                        await this.addCommitIds(branchList[i])
                    }
                    await this.updateHeaderBarAndGraph(branches);
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
        return branchRef.name().replace("refs/heads/", "").replace("refs/remotes/", "");
    }

    /**
     * Adds the commit ids of each branch to the internal branchRefs data structure.
     * @param branchRef the reference for the branch.
     */
    private addCommitIds(branchRef: Reference): Promise<void> {
        // Since the repo is refreshed, the branch refs are also reset.

        return new Promise((resolve, reject) => {
            const branchName = this.extractBranchName(branchRef)
            Git.Reference.nameToId(this.currentRepo, branchRef.name())
                .then((id) => {
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
                    resolve();
                }).catch((err) => {
                    reject(err);
                })

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
     * @param branchName name of branch to checkout into.
     */
    public checkoutLocalBranch(branchName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const headPrefix = "refs/heads/"
            this.currentRepo.checkoutBranch(headPrefix + branchName)
                .then(() => {
                    addCommand("git checkout " + branchName);
                    resolve();
                })
                .catch((err) => {
                    this.popupService.showInfo(err, PopupStyles.Error);
                    console.log(err);
                    reject(err);
                })
        })
    }

    public async updateHeaderBarAndGraph(branches: { [key: string]: Array<string> }): Promise<void> {
        clearBranchElement();
        drawGraph(this.branchRefs)
        const currentBranch = await this.getCurrentBranchName()
        changeRepoName(this.savedRepoPath);
        changeBranchName(currentBranch);

        branches['local'].forEach( (branchName) => {
            displayBranch(branchName, "branch-dropdown", () => {
                this.checkoutLocalBranch(branchName).then(() => {
                    changeBranchName(branchName);
                }).catch((err) => {
                    this.popupService.showInfo(err, PopupStyles.Error);
                });
            })
        })

        // The checkout remote branch function is not implmented
        // branches['remote'].forEach( (branchName) => {
        //     displayBranch(branchName, "branch-dropdown",  () => repositoryService.checkoutRemoteBranch(branchName))
        // })
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
