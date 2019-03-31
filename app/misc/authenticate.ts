import { getUsernameTemp, getPasswordTemp } from "./storeCredentials";
import { GitUtils } from "./git";
import * as $ from "jquery";
import * as github from "octonode";
import { displayBranch, updateModalText, downloadFunc } from "./repo";

let client;
let repoList = {};
let url;
export class AuthUtils {
    public static changes = 0;
}

// Called then user pushes to sign out even if they have commited changes but not pushed; prompts a confirmation modal
function CommitNoPush() {
    if (GitUtils.CommitButNoPush == 1) {
        $("#modalW2").modal();
    }
}

// TODO: Can remove this code once RepositoryService has been done to automatically fetch repositories upon successful login.
function getUserInfo(callback) {
    client = github.client({
        username: getUsernameTemp(),
        password: getPasswordTemp(),
    });
    const ghme = client.me();

    ghme.repos(function (err, data, head) {
        if (err) {
            return;
        } else {
            console.log(data.length);
            for (let i = 0; i < data.length; i++) {
                const rep = Object.values(data)[i];
                console.log(rep.html_url);
                displayBranch(rep.full_name, "repo-dropdown", "selectRepo(this)");
                repoList[rep.full_name] = rep.html_url;
            }
        }
    });
}

// TODO: Can remove this code once RepositoryService has been done.
export function selectRepo(ele) {
    url = repoList[ele.innerHTML];
    const butt = document.getElementById("cloneButton");
    butt.innerHTML = "Clone " + ele.innerHTML;
    butt.setAttribute("class", "btn btn-primary");
    console.log(url + "JJJJJJJJ" + ele.innerHTML);
}

// TODO: Can remove this code once RepositoryService has been done.
export function cloneRepo() {
    if (url === null) {
        updateModalText("Web URL for repo could not be found. Try cloning by providing the repo's web URL directly in the 'Add repository' window");
        return;
    }

    console.log("cloneRepo().url = " + url);
    const splitUrl = url.split("/");
    let local;
    if (splitUrl.length >= 2) {
        local = splitUrl[splitUrl.length - 1];
    }
    console.log("cloneRepo().local = " + local);

    if (local == null) {
        updateModalText("Error: could not define name of repo");
        return;
    }

    downloadFunc(url, local);
    url = null;
    $("#repo-modal").modal("hide");
}
