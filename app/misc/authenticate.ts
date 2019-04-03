import { displayBranch, updateModalText, downloadFunc } from "./repo";

require("bootstrap");
let $ = require("jquery");
import * as $ from "jquery";
import "bootstrap";

let url;
export class AuthUtils {
    public static changes = 0;
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
