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
    displayDiffPanelButtons();
}

export function hideDiffPanel() {
    document.getElementById("diff-panel").style.width = "0";
    document.getElementById("graph-panel").style.width = "100%";
    disableDiffPanelEditOnHide();
    hideDiffPanelButtons();
}


function displayDiffPanelButtons() {
    // document.getElementById("save-button").style.visibility = "visible";
    // document.getElementById("cancel-button").style.visibility = "visible";
}

function hideDiffPanelButtons() {
    disableSaveCancelButton();
    disableDiffPanelEditOnHide();
}

function disableSaveCancelButton() {
    // const saveButton = document.getElementById("save-button");
    // const cancelButton = document.getElementById("cancel-button");
    // saveButton.disabled = true;
    // saveButton.style.backgroundColor = gray;
    // cancelButton.disabled = true;
    // cancelButton.style.backgroundColor = gray;
}

function disableDiffPanelEditOnHide() {
//   const doc = document.getElementById("diff-panel-body");
//   doc.contentEditable = "false";
}
