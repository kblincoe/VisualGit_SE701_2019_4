let Git = require("nodegit");
let $ = require("jquery");
require("bootstrap");
import { addCommand } from "./gitCommands";
import { RouterCredentials } from "./router";
import { drawGraph } from "./graphSetup";
export let repoFullPath;
let repoLocalPath;
export let bname = {};
let branchCommit = [];
let remoteName = {};
let localBranches = [];

export function downloadFunc(cloneURL, fullLocalPath) {
    console.log("downloadFunc().fullLocalPath = " + fullLocalPath);
    let options = {};

    displayModal("Cloning Repository...");

    options = {
        fetchOpts: {
            callbacks: {
                certificateCheck() { return 0; },
            },
        },
    };

    console.log("cloning into " + fullLocalPath);
    Git.Clone(cloneURL, fullLocalPath, options)
        .then(function (repository) {
            console.log("Repo successfully cloned");
            refreshAll(repository);
            updateModalText("Clone Successful, repository saved under: " + fullLocalPath);
            addCommand("git clone " + cloneURL + " " + fullLocalPath);
            repoFullPath = fullLocalPath;
            repoLocalPath = fullLocalPath;
            refreshAll(repository);
        },
            function (err) {
                updateModalText("Clone Failed - " + err);
                console.log("repo.ts, Line 68. Error is: " + err); // TODO show error on screen
            });
}

export function refreshAll(repository) {
    let branch;
    bname = [];
    repository.getCurrentBranch()
        .then(function (reference) {
            const branchParts = reference.name().split("/");
            console.log("Attaining branch parts: " + branchParts);
            branch = branchParts[branchParts.length - 1];
        }, function (err) {
            console.log("Branch could not be fetched - Error: " + err); // TODO show error on screen
        })
        .then(function () {
            return repository.getReferences(Git.Reference.TYPE.LISTALL);
        })
        .then(function (branchList) {
            const count = 0;
            clearBranchElement();
            for (let i = 0; i < branchList.length; i++) {
                const bp = branchList[i].name().split("/");
                Git.Reference.nameToId(repository, branchList[i].name()).then(function (oid) {
                    if (branchList[i].isRemote()) {
                        remoteName[bp[bp.length - 1]] = oid;
                    } else {
                        branchCommit.push(branchList[i]);
                        console.log(bp[bp.length - 1] + "--------" + oid.tostrS());
                        if (oid.tostrS() in bname) {
                            bname[oid.tostrS()].push(branchList[i]);
                        } else {
                            bname[oid.tostrS()] = [branchList[i]];
                        }
                    }
                }, function (err) {
                    console.log("repo.ts, Line 162. Error is: " + err);
                });
                if (branchList[i].isRemote()) {
                    if (localBranches.indexOf(bp[bp.length - 1]) < 0) {
                        displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutRemoteBranch(this)");
                    }
                } else {
                    localBranches.push(bp[bp.length - 1]);
                    displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutLocalBranch(this)");
                }

            }
        })
        .then(function () {
            console.log("Updating the graph and the labels");
            drawGraph(bname);
            changeRepoName(repoLocalPath)
            changeBranchName(branch);
        });
}

export function changeRepoName(name) {
    document.getElementById("repo-name").innerHTML = name;
}

export function changeBranchName(name) {
    document.getElementById("branch-name").innerHTML = name + '<span class="caret"></span>';
}

export function clearMergeElement() {
    const ul = document.getElementById("merge-dropdown");
    ul.innerHTML = "";
}

export function clearBranchElement() {
    const ul = document.getElementById("branch-dropdown");
    const li = document.getElementById("create-branch");
    ul.innerHTML = "";
    ul.appendChild(li);
}

export function displayBranch(name, id, onclick) {
    const ul = document.getElementById(id);
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("class", "list-group-item");
    a.setAttribute("onclick", onclick);
    li.setAttribute("role", "presentation");
    a.appendChild(document.createTextNode(name));
    li.appendChild(a);
    ul.appendChild(li);
}

export function displayModal(text) {
    document.getElementById("modal-text-box").innerHTML = text;
    $("#modal").modal("show");
}

export function updateModalText(text) {
    document.getElementById("modal-text-box").innerHTML = text;
    $("#modal").modal("show");
}

function checkoutRemoteBranch(element) {
    let bn;
    if (typeof element === "string") {
        bn = element;
    } else {
        bn = element.innerHTML;
    }
    console.log("1.0  " + bn);
    let repos;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            addCommand("git fetch");
            addCommand("git checkout -b " + bn);
            const cid = remoteName[bn];
            console.log("2.0  " + cid);
            return Git.Commit.lookup(repo, cid);
        })
        .then(function (commit) {
            console.log("3.0");
            return Git.Branch.create(repos, bn, commit, 0);
        })
        .then(function (code) {
            console.log(bn + "PPPPPPP");
            repos.mergeBranches(bn, "origin/" + bn)
                .then(function () {
                    refreshAll(repos);
                    console.log("Pull successful");
                });
        }, function (err) {
            console.log(err);
        });
}

function checkoutLocalBranch(element) {
    let bn;
    console.log("The element type is: " + typeof element);
    if (typeof element === "string") {
        bn = element;
    } else {
        bn = element.innerHTML;
    }
    console.log("repo.ts, Line 245. Message is: " + bn);
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            addCommand("git checkout " + bn);
            repo.checkoutBranch("refs/heads/" + bn)
                .then(function () {
                    refreshAll(repo);
                }, function (err) {
                    console.log("repo.ts, Line 253. Error is: " + err);
                });
        });
}