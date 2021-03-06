import { hideDiffPanel, RouterCredentials, displayDiffPanel } from "./router";
import { displayModal, updateModalText } from "./repo";
import { RepositoryService } from "../services/repository.service"
import { addCommand } from "./gitCommands";
import { drawGraph } from "./graphSetup";
require("bootstrap");
import { AppModule } from "../app.module";
import { UserService } from "../services/user/user.service";
import { DiffService } from "../services/diff-service/diff-service";
import { ModifiedFile } from "../modifiedFile";
import { FileService } from "../services/file.service";
import { PopupService } from "../services/popup/popup.service";
import { PopupStyles } from "../components/popup/popup.component";
const opn = require("opn");
const $ = require("jquery");
const Git = require("nodegit");
const fs = require("fs");
const path = require("path");
const async = require("async");
const readFile = require("fs-sync");
const green = "#84db00";
let repo, index, oid, remote, commitMessage;
let filesToAdd = [];
let theirCommit = null;
let warnbool;
export var repoLoaded:boolean = false;


export class GitUtils {
    
    public static CommitButNoPush = 0;
}

export function addAndCommit(files: ModifiedFile[]) {
    let repository;
    const userService = AppModule.injector.get(UserService);
    const repoService = AppModule.injector.get(RepositoryService);
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;

    Git.Repository.open(repoFullPath)
        .then(function (repoResult) {
            repository = repoResult;
            console.log("1.0");
            return repository.refreshIndex();
        })

        .then(function (indexResult) {
            console.log("2.0");
            index = indexResult;
            const filesToStage = [];
            filesToAdd = [];
            for (let file of files) {
                filesToStage.push(file.filePath);
                filesToAdd.push(file.filePath);
            }
            if (filesToStage.length > 0) {
                console.log("2.1");
                return index.addAll(filesToStage);
            } else {
                // If no files checked, then throw error to stop empty commits
                throw new Error("No files selected to commit.");
            }
        })

        .then(function () {
            console.log("3.0");
            return index.write();
        })

        .then(function () {
            console.log("4.0");
            return index.writeTree();
        })

        .then(function (oidResult) {
            console.log("5.0");
            oid = oidResult;
            return Git.Reference.nameToId(repository, "HEAD");
        })

        .then(function (head) {
            console.log("6.0");
            return repository.getCommit(head);
        })

        .then(function (parent) {
            console.log("7.0");
            let sign;
            if (userService.username !== "" && userService.email !== "") {
                sign = Git.Signature.now(userService.username, userService.email);
            } else {
                sign = Git.Signature.default(repository);
            }
            commitMessage = document.getElementById("commit-message-input").value;
            // console.log(sign.toString());
            if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
                const tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
                console.log("theirComit: " + tid);
                console.log("ourCommit: " + parent.id.toString());
                return repository.createCommit("HEAD", sign, sign, commitMessage, oid, [parent.id().toString(), tid.trim()]);
            } else {
                console.log("no other commit");
                return repository.createCommit("HEAD", sign, sign, commitMessage, oid, [parent]);
            }
        })
        .then(function (oid) {
            theirCommit = null;
            // console.log("8.0");
            GitUtils.CommitButNoPush = 1;
            console.log("Commit successful: " + oid.tostrS());

            hideDiffPanel();
            clearCommitMessage();
            clearSelectAllCheckbox();
            window.onbeforeunload = Confirmed;
            for (let i = 0; i < filesToAdd.length; i++) {
                addCommand("git add " + filesToAdd[i]);
            }
            addCommand('git commit -m "' + commitMessage + '"');
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
        }, function (err) {
            console.log("git.ts, Line 115. The error is: " + err);
            // Added error thrown for if files not selected
            if (err.message == "No files selected to commit.") {
                displayModal(err.message);
            } else {
                updateModalText("Oops, error occours! If u haven't login, please login and try again.");
            }
        });
}

function clearCommitMessage() {
    document.getElementById("commit-message-input").value = "";
}

function clearSelectAllCheckbox() {
    document.getElementById("select-all-checkbox").checked = false;
}

export function getAllCommits(callback) {
    // Git.Repository.open(repoFullPath)
    // .then(function(repo) {
    //   return repo.getHeadCommit();
    // })
    // .then(function(firstCommitOnMaster){
    //   let history = firstCommitOnMaster.history(Git.Revwalk.SORT.Time);
    //
    //   history.on("end", function(commits) {
    //     callback(commits);
    //   });
    //
    //   history.start();
    // });

    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    let repos;
    const allCommits = [];
    const aclist = [];
    console.log("1.0");
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            console.log("2.0");
            return repo.getReferences(Git.Reference.TYPE.LISTALL);
        })
        .then(function (refs) {
            let count = 0;
            console.log("3.0    " + refs.length);
            async.whilst(
                function () {
                    return count < refs.length;
                },

                function (cb) {
                    if (!refs[count].isRemote()) {
                        console.log("4.0");
                        repos.getReferenceCommit(refs[count])
                            .then(function (commit) {
                                const history = commit.history(Git.Revwalk.SORT.Time);
                                history.on("end", function (commits) {
                                    for (let i = 0; i < commits.length; i++) {
                                        if (aclist.indexOf(commits[i].toString()) < 0) {
                                            allCommits.push(commits[i]);
                                            aclist.push(commits[i].toString());
                                        }
                                    }
                                    count++;
                                    console.log(count + "-------" + allCommits.length);
                                    cb();
                                });

                                history.start();
                            });
                    } else {
                        console.log("Counter is incremented");
                        count++;
                        cb();
                    }
                },

                function (err) {
                    console.log("Error states: " + err);
                    callback(allCommits);
                });
        });
}

export function pullFromRemote() {
    if(this.repoLoaded == false){
        displayModal("Failed to pull, please select a repository");
        return;
    }
    const userService = AppModule.injector.get(UserService);
    let repository;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    const branch = document.getElementById("branch-name").innerText;
    if (AppModule.injector.get(FileService).modifiedFilesLength > 0) {
        updateModalText("Please commit before pulling from remote!");
        return;
    }
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repository = repo;

            return repo.getRemotes().then(function (remotes) {
                if (remotes.length === 0) {
                    throw new Error("No remotes to pull from");
                }
            });
        })
        .then(function () {
            console.log("Pulling changes from remote...");
            addCommand("git pull");
            displayModal("Pulling new changes from the remote repository");

            return Promise.all(this.repoService.remoteNames.map((remote) => {
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
        })
        // Now that we're finished fetching, go ahead and merge our local branch
        // with the new one
        .then(function () {
            return Git.Reference.nameToId(repository, "refs/remotes/origin/" + branch);
        })
        .then(function (oid) {
            console.log("3.0  " + oid);
            return Git.AnnotatedCommit.lookup(repository, oid);
        })
        .then(function (annotated) {
            console.log("4.0  " + annotated);
            Git.Merge.merge(repository, annotated, null, {
                checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
            });
            theirCommit = annotated;
        })
        .then(function () {
            let conflicsExist = false;

            if (readFile.exists(repoFullPath + "/.git/MERGE_MSG")) {
                const tid = readFile.read(repoFullPath + "/.git/MERGE_MSG", null);
                conflicsExist = tid.indexOf("Conflicts") !== -1;
            }

            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;

            if (conflicsExist) {
                updateModalText("Conflicts exists! Please check files list on right side and solve conflicts before you commit again!");
                repositoryService.refreshBranches();
            } else {
                updateModalText("Successfully pulled from remote branch " + branch + ", and your repo is up to date now!");
                repositoryService.refreshBranches();
            }
        })
        .catch(function (error) {
            console.error("Pull error", error);
            let message = "Unable to pull changes from remote";
            if (error != null && error.message != null) {
                message += "<br><br>" + error.message;
            }
            displayModal(message);
        });
}

export function pushToRemote() {
    if(this.repoLoaded == false){
        displayModal("Failed to push, please select a repository");
        return;
    }
    const userService = AppModule.injector.get(UserService);
    const branch = document.getElementById("branch-name").innerText;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            console.log("Pushing changes to remote");
            displayModal("Pushing changes to remote...");
            addCommand("git push -u origin " + branch);
            repo.getRemotes()
                .then(function (remotes) {
                    repo.getRemote(remotes[0])
                        .then(function (remote) {
                            return remote.push(
                                ["refs/heads/" + branch + ":refs/heads/" + branch],
                                {
                                    callbacks: {
                                        credentials() {
                                            return userService.credentials;
                                        },
                                    },
                                },
                            );
                        })
                        .then(function () {
                            GitUtils.CommitButNoPush = 0;
                            window.onbeforeunload = Confirmed;
                            console.log("Push successful");
                            updateModalText("Push successful");
                            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
                            repositoryService.refreshBranches();
                        });
                });
        });
}

export function createBranch() {
    const branchName = document.getElementById("branchName").value;
    let repos;
    const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
    const repoFullPath = repositoryService.savedRepoPath;
    console.log("Trying to create " + branchName);
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            // Create a new branch on head
            repos = repo;
            addCommand("git branch " + branchName);
            return repo.getHeadCommit()
                .then(function (commit) {
                    return repo.createBranch(
                        branchName,
                        commit,
                        0,
                        repo.defaultSignature(),
                        "Created new-branch on HEAD");
                }).catch((err) => {
                    const popupService = AppModule.injector.get(PopupService) as PopupService;
                    popupService.showInfo(err, PopupStyles.Error);
                }).done(function () {
                    repositoryService.refreshBranches();
                    console.log("All done!");
                });
        });
    document.getElementById("branchName").value = "";
}

function mergeLocalBranches(element) {
    const bn = element.innerHTML;
    let fromBranch;
    let repos;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
        })
        .then(function () {
            addCommand("git merge " + bn);
            return repos.getBranch("refs/heads/" + bn);
        })
        .then(function (branch) {
            console.log(branch.name());
            fromBranch = branch;
            return repos.getCurrentBranch();
        })
        .then(function (toBranch) {
            console.log(toBranch.name());
            return repos.mergeBranches(toBranch,
                fromBranch,
                repos.defaultSignature(),
                Git.Merge.PREFERENCE.NONE,
                null);
        })
        .then(function (index) {
            let text;
            console.log(index);
            if (index instanceof Git.Index) {
                text = "Conflicts Exist";
            } else {
                text = "Merge Successfully";
            }
            console.log(text);
            updateModalText(text);
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
        });
}

export function mergeCommits(from) {
    let repos;
    let index;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            // return repos.getCommit(fromSha);
            addCommand("git merge " + from);
            return Git.Reference.nameToId(repos, "refs/heads/" + from);
        })
        .then(function (oid) {
            console.log("3.0  " + oid);
            return Git.AnnotatedCommit.lookup(repos, oid);
        })
        .then(function (annotated) {
            console.log("4.0  " + annotated);
            Git.Merge.merge(repos, annotated, null, {
                checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
            });
            theirCommit = annotated;
        })
        .then(function () {
            if (fs.existsSync(repoFullPath + "/.git/MERGE_MSG")) {
                updateModalText("Conflicts exists! Please check files list on right side and solve conflicts before you commit again!");
                const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
                repositoryService.refreshBranches();
            } else {
                updateModalText("Successfully Merged!");
                const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
                repositoryService.refreshBranches();
            }
        });
}

export function rebaseCommits(from: string, to: string) {
    let repos;
    let index;
    let branch;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            // return repos.getCommit(fromSha);
            addCommand("git rebase " + to);
            return Git.Reference.nameToId(repos, "refs/heads/" + from);
        })
        .then(function (oid) {
            console.log("3.0  " + oid);
            return Git.AnnotatedCommit.lookup(repos, oid);
        })
        .then(function (annotated) {
            console.log("4.0  " + annotated);
            branch = annotated;
            return Git.Reference.nameToId(repos, "refs/heads/" + to);
        })
        .then(function (oid) {
            console.log("5.0  " + oid);
            return Git.AnnotatedCommit.lookup(repos, oid);
        })
        .then(function (annotated) {
            console.log("6.0");
            return Git.Rebase.init(repos, branch, annotated, null, null);
        })
        .then(function (rebase) {
            console.log("7.0");
            return rebase.next();
        })
        .then(function (operation) {
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
        });
}

function rebaseInMenu(from: string, to: string) {
    const p1 = document.getElementById("fromRebase");
    const p2 = document.getElementById("toRebase");
    const p3 = document.getElementById("rebaseModalBody");
    p1.innerHTML = from;
    p2.innerHTML = to;
    p3.innerHTML = "Do you want to rebase branch " + from + " to " + to + " ?";
    $("#rebaseModal").modal("show");
}

function mergeInMenu(from: string) {
    const p1 = document.getElementById("fromMerge");
    const p3 = document.getElementById("mergeModalBody");
    p1.innerHTML = from;
    p3.innerHTML = "Do you want to merge branch " + from + " to HEAD ?";
    $("#mergeModal").modal("show");
}

function resetCommit(name: string) {
    let repos;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            addCommand("git reset --hard");
            return Git.Reference.nameToId(repo, name);
        })
        .then(function (id) {
            console.log("2.0" + id);
            return Git.AnnotatedCommit.lookup(repos, id);
        })
        .then(function (commit) {
            const checkoutOptions = new Git.CheckoutOptions();
            return Git.Reset.fromAnnotated(repos, commit, Git.Reset.TYPE.HARD, checkoutOptions);
        })
        .then(function (number) {
            console.log(number);
            if (number !== 0) {
                updateModalText("Reset failed, please check if you have pushed the commit.");
            } else {
                updateModalText("Reset successfully.");
            }
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
        }, function (err) {
            updateModalText(err);
        });
}

function revertCommit(name: string) {
    let repos;
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            console.log(1.0);
            addCommand("git revert " + name + "~1");
            return Git.Reference.nameToId(repo, name);
        })
        .then(function (id) {
            console.log("2.0" + id);
            return Git.Commit.lookup(repos, id);
        })
        .then(function (commit) {
            const revertOptions = new Git.RevertOptions();
            if (commit.parents().length > 1) {
                revertOptions.mainline = 1;
            }
            return Git.Revert.revert(repos, commit, revertOptions);
        })
        .then(function (number) {
            console.log(number);
            if (number === -1) {
                updateModalText("Revert failed, please check if you have pushed the commit.");
            } else {
                updateModalText("Revert successfully.");
            }
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
        }, function (err) {
            updateModalText(err);
        });
}

// Makes a modal for confirmation pop up instead of actually exiting application for confirmation.
function ExitBeforePush() {
    $("#modalW").modal();
}

function Confirmed() {

}

// makes the onbeforeunload function nothing so the window actually closes; then closes it.
export function Close() {
    window.onbeforeunload = Confirmed;
    window.close();

}

export function Reload() {
    window.onbeforeunload = Confirmed;
    location.reload();
}

// Find HOW the file has been modified
export function calculateModification(status) {
    if (status.isNew()) {
        return "NEW";
    } else if (status.isModified()) {
        return "MODIFIED";
    } else if (status.isDeleted()) {
        return "DELETED";
    } else if (status.isTypechange()) {
        return "TYPECHANGE";
    } else if (status.isRenamed()) {
        return "RENAMED";
    } else if (status.isIgnored()) {
        return "IGNORED";
    }
}

function deleteFile(filePath: string) {
    const newFilePath = filePath.replace(/\\/gi, "/");
    if (fs.existsSync(newFilePath)) {
        fs.unlink(newFilePath, (err) => {
            if (err) {
                alert("An error occurred updating the file" + err.message);
                console.log(err);
                return;
            }
            console.log("File successfully deleted");
        });
    } else {
        alert("This file doesn't exist, cannot delete");
    }
}

export function cleanRepo() {
    if(this.repoLoaded == false){
        displayModal("Failed to clean, please select a repository");
        return;
    }
        let fileCount = 0;
        const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
        Git.Repository.open(repoFullPath)
            .then(function (repo) {
                console.log("Removing untracked files");
                displayModal("Removing untracked files...");
                addCommand("git clean -f");
                repo.getStatus().then(function (arrayStatusFiles) {
                    arrayStatusFiles.forEach(deleteUntrackedFiles);

                    // Gets NEW/untracked files and deletes them
                    function deleteUntrackedFiles(file) {
                        const filePath = repoFullPath + "\\" + file.path();
                        const modification = calculateModification(file);
                        if (modification === "NEW") {
                            console.log("DELETING FILE " + filePath);
                            deleteFile(filePath);
                            console.log("DELETION SUCCESSFUL");
                            fileCount++;
                        }
                    }

                })
                    .then(function () {
                        console.log("Cleanup successful");
                        if (fileCount !== 0) {
                            updateModalText("Cleanup successful. Removed " + fileCount + " files.");
                        } else {
                            updateModalText("Nothing to remove.");
                        }
                        const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
                        repositoryService.refreshBranches();
                        });
            },
                function (err) {
                    console.log("Waiting for repo to be initialised");
                    displayModal("Please select a valid repository");
                });
}

/**
 * This method is called when the sync button is pressed, and causes the fetch-modal
 * to appear on the screen.
 */
export function requestLinkModal() {
    $("#fetch-modal").modal();
}

/**
 * This method is called when a valid URL is given via the fetch-modal, and runs the
 * series of git commands which fetch and merge from an upstream repository.
 */
export function fetchFromOrigin() {
    console.log("begin fetching");
    const repoFullPath = AppModule.injector.get(RepositoryService).savedRepoPath;
    const upstreamRepoPath = document.getElementById("origin-path").value;
    if (upstreamRepoPath != null) {
        Git.Repository.open(repoFullPath)
            .then(function (repo) {
                console.log("fetch path valid");
                displayModal("Beginning Synchronisation...");
                addCommand("git remote add upstream " + upstreamRepoPath);
                addCommand("git fetch upstream");
                addCommand("git merge upstream/master");
                console.log("fetch successful");
                updateModalText("Synchronisation Successful");
                const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
                repositoryService.refreshBranches();
            },
                function (err) {
                    console.log("Waiting for repo to be initialised");
                    displayModal("Please select a valid repository");
                });
    } else {
        displayModal("No Path Found.");
    }
}