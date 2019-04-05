let blue = "#39c0ba";
let gray = "#5b6969";

let $ = require("jquery");

export class RouterCredentials {
    public static cred;
}

export function collpaseSignPanel() {
    $("#nav-collapse1").collapse("hide");
}

export function displayDiffPanel() {
    document.getElementById("graph-panel").style.width = "60%";
    document.getElementById("diff-panel").style.width = "40%";
}

export function hideDiffPanel() {
    document.getElementById("diff-panel").style.width = "0";
    document.getElementById("graph-panel").style.width = "100%";
}
