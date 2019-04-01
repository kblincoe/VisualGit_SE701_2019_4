let Git = require("nodegit");
let $ = require("jquery");
import "bootstrap";
import { addCommand } from "./gitCommands";
import { RouterCredentials } from "./router";
import { drawGraph } from "./graphSetup";
export let repoFullPath;
let repoLocalPath;
export let bname = {};
let branchCommit = [];
let remoteName = {};
let localBranches = [];

let savedFullLocalPath;
let savedLocalPath;
let readFile = require("fs-sync");
let checkFile = require("fs");
let repoCurrentBranch = "master";
let modal;
let span;

export function downloadRepository() {
    let fullLocalPath;
    // Full path is determined by either handwritten directory or selected by file browser
    if (document.getElementById("repoSave").value != null || document.getElementById("repoSave").value != "") {
        const localPath = document.getElementById("repoSave").value;
        fullLocalPath = require("path").join(__dirname, localPath);
    } else {
        fullLocalPath = document.getElementById("dirPickerSaveNew").files[0].path;
    }
    const cloneURL = document.getElementById("repoClone").value;

    if (!cloneURL || cloneURL.length === 0) {
        updateModalText("Clone Failed - Empty URL Given");
    } else {
        downloadFunc(cloneURL, fullLocalPath);
    }

}

export function downloadFunc(cloneURL, fullLocalPath) {
    console.log("downloadFunc().fullLocalPath = " + fullLocalPath);
    let options = {};

    displayModal("Cloning Repository...");

    options = {
        fetchOpts: {
            callbacks: {
                certificateCheck() { return 1; },
                credentials: () => RouterCredentials.cred,
            },
        },
    };

    console.log("cloning into " + fullLocalPath);
    const repository = Git.Clone.clone(cloneURL, fullLocalPath, options)
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
                console.log(err); // TODO show error on screen
            });
}

export function openRepository() {
    let fullLocalPath;
    let localPath;
    // Full path is determined by either handwritten directory or selected by file browser
    if (document.getElementById("repoOpen").value == null || document.getElementById("repoOpen").value == "") {
        localPath = document.getElementById("dirPickerOpenLocal").files[0].webkitRelativePath;
        fullLocalPath = document.getElementById("dirPickerOpenLocal").files[0].path;
        document.getElementById("repoOpen").value = fullLocalPath;
        document.getElementById("repoOpen").text = fullLocalPath;
    } else {
        localPath = document.getElementById("repoOpen").value;
        if (checkFile.existsSync(localPath)) {
            fullLocalPath = localPath;
        } else {
            fullLocalPath = require("path").join(__dirname, localPath);
        }
    }

    console.log("Trying to open repository at " + fullLocalPath);
    displayModal("Opening Local Repository...");

    savedFullLocalPath = fullLocalPath;
    savedLocalPath = localPath;

    Git.Repository.open(fullLocalPath).then(function (repository) {
        repoFullPath = fullLocalPath;
        repoLocalPath = localPath;
        if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
            const tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
            console.log("theirComit: " + tid);
        }
        refreshAll(repository);
        console.log("Repo successfully opened");
        updateModalText("Repository successfully opened");
    },
        function (err) {
            updateModalText("Opening Failed - " + err);
            console.log(err); // TODO show error on screen
        });
}

/* Added function to prevent crashing due to pulling after returning to main panel from logout page */
export function refreshRepo() {

    Git.Repository.open(savedFullLocalPath).then(function (repository) {
        repoFullPath = savedFullLocalPath;
        repoLocalPath = savedLocalPath;
        if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
            const tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
            console.log("theirComit: " + tid);
        }
        refreshAll(repository);
    },
    function (err) {
        console.log(err); // TODO show error on screen
    });
}

export function refreshAll(repository) {
    let branch;
    bname = [];
    repository.getCurrentBranch()
        .then(function (reference) {
            const branchParts = reference.name().split("/");
            console.log(branchParts + "OOOOOOOOOOO");
            branch = branchParts[branchParts.length - 1];
        }, function (err) {
            console.log(err + "?????"); // TODO show error on screen
        })
        .then(function () {
            return repository.getReferences(Git.Reference.TYPE.LISTALL);
        })
        .then(function (branchList) {
            const count = 0;
            clearBranchElement();
            for (let i = 0; i < branchList.length; i++) {
                // console.log(branchList[i].name() + "!!!!");
                const bp = branchList[i].name().split("/");
                Git.Reference.nameToId(repository, branchList[i].name()).then(function (oid) {
                    // Use oid
                    // console.log(oid + "  TTTTTTTT");
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
                    console.log(err + "?????????");
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
            drawGraph();
            document.getElementById("repo-name").innerHTML = repoLocalPath;
            document.getElementById("branch-name").innerHTML = branch + '<span class="caret"></span>';
        });
}

export function getOtherBranches() {
    let list;
    let repos;
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            repos = repo;
            return repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
        })
        .then(function (branchList) {
            clearMergeElement();
            list = branchList;
        })
        .then(function () {
            return repos.getCurrentBranch();
        })
        .then(function (ref) {
            const name = ref.name().split("/");
            console.log("&&&&&&&");
            clearBranchElement();
            for (let i = 0; i < list.length; i++) {
                const bp = list[i].split("/");
                if (bp[1] !== "remotes" && bp[bp.length - 1] !== name[name.length - 1]) {
                    displayBranch(bp[bp.length - 1], "merge-dropdown", "mergeLocalBranches(this)");
                }
            }
        });

}

function clearMergeElement() {
    const ul = document.getElementById("merge-dropdown");
    ul.innerHTML = "";
}

function clearBranchElement() {
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

function checkoutLocalBranch(element) {
    let bn;
    console.log(typeof element + "UUUUUUUUU");
    if (typeof element === "string") {
        bn = element;
    } else {
        bn = element.innerHTML;
    }
    console.log(bn + ">>>>>>>>");
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
            addCommand("git checkout " + bn);
            repo.checkoutBranch("refs/heads/" + bn)
                .then(function () {
                    refreshAll(repo);
                }, function (err) {
                    console.log(err + "<<<<<<<");
                });
        });
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

// function initModal() {
//   modal = document.getElementById("modal");
//   btn = document.getElementById("new-repo-button");
//   confirmBtn = document.getElementById("confirm-button");
//   span = document.getElementsByClassName("close")[0];
// }

// function handleModal() {
//   // When the user clicks on <span> (x), close the modal
//   span.onclick = function() {
//     modal.style.display = "none";
//   };
//
//   // When the user clicks anywhere outside of the modal, close it
//   window.onclick = function(event) {
//
//     if (event.target === modal) {
//       modal.style.display = "none";
//     }
//   };
// }

export function displayModal(text) {
    //  initModal();
    //  handleModal();
    document.getElementById("modal-text-box").innerHTML = text;
    $("#modal").modal("show");
}

export function updateModalText(text) {
    document.getElementById("modal-text-box").innerHTML = text;
    $("#modal").modal("show");
}
