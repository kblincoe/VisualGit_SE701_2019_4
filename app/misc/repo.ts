let Git = require("nodegit");
require("bootstrap");
import { addCommand } from "./gitCommands";
import { AppModule } from "../app.module";
import { PopupService } from "../services/popup/popup.service";
import { RepositoryService } from "../services/repository.service";
export let repoFullPath;
export let bname = {};


export function downloadFunc(cloneURL, fullLocalPath) {
    console.log("downloadFunc().fullLocalPath = " + fullLocalPath);
    let options = {};

    displayModal("Cloning Repository...");
    let cloneProgressBox = document.getElementById("clone-progress-box");
    let cloneProgressBar = document.getElementById("clone-progress-bar");
    cloneProgressBox.style.display = "block";
    cloneProgressBar.style.width = "0%";
    cloneProgressBar.innerHTML = "0%";

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
            cloneProgressBox.style.display = "none";
            const repositoryService = AppModule.injector.get(RepositoryService) as RepositoryService;
            repositoryService.refreshBranches();
            updateModalText("Clone Successful, repository saved under: " + fullLocalPath);
            addCommand("git clone " + cloneURL + " " + fullLocalPath);
            repoFullPath = fullLocalPath;
            repositoryService.refreshBranches();
        },
            function (err) {
                updateModalText("Clone Failed - " + err);
                console.log("repo.ts, Line 68. Error is: " + err); // TODO show error on screen
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
    a.onclick = (e: MouseEvent) => {
        e.preventDefault();
        onclick();
    };
    li.setAttribute("role", "presentation");
    a.appendChild(document.createTextNode(name));
    li.appendChild(a);
    ul.appendChild(li);
}

// Keep track of the modals opened by text and cancel the previously queued modal
// for a specific string -> prevents modal spamming
const prevModalCancels: { [key: string]: () => void} = {};

export function displayModal(text) {
    if (prevModalCancels[text]) {
        prevModalCancels[text]();
    }

    const popupService: PopupService = AppModule.injector.get(PopupService);
    prevModalCancels[text] = popupService.showInfo(text);
}

export function updateModalText(text) {
    displayModal(text);
}

export function loadingModal() {
    let loader = document.getElementById("circular-loader");
    loader.style.display = "block";
}

export function loadingModalHide() {
    let loader = document.getElementById("circular-loader");
    loader.style.display = "none";
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

export function resetCloneProgress() {
    let cloneProgressBox = document.getElementById("clone-progress-box");
    let cloneProgressBar = document.getElementById("clone-progress-bar");
    cloneProgressBox.style.display = "block";
    cloneProgressBar.style.width = "0%";
    cloneProgressBar.innerHTML = "0%";
}

export function transferCloneProgress(stats) {
    const progress = Math.round((100 * (stats.receivedObjects() + stats.indexedObjects())) / (stats.totalObjects() * 2) * 100) / 100;
    let cloneProgressBar = document.getElementById("clone-progress-bar");
    cloneProgressBar.style.width = progress + "%";
    cloneProgressBar.innerHTML = progress + "%";
}

export function closeBar() {
    let cloneProgressBox = document.getElementById("clone-progress-box");
    cloneProgressBox.style.display = "none";
}
