let blue = "#39c0ba";
let gray = "#5b6969";

import * as $ from "jquery";

export class RouterCredentials {
    public static cred;
}

export function collpaseSignPanel() {
    $("#nav-collapse1").collapse("hide");
}

export function switchToClonePanel() {
    console.log("switch to clone panel");
    hideAuthenticatePanel();
    hideFilePanel();
    hideGraphPanel();
    displayClonePanel();
}

export function switchToMainPanel() {
    hideAuthenticatePanel();
    hideAddRepositoryPanel();
    displayFilePanel();
    displayGraphPanel();
}

export function switchToAddRepositoryPanel() {
    hideAuthenticatePanel();
    hideFilePanel();
    hideGraphPanel();
    displayAddRepositoryPanel();
}

function wait(ms) {
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

function displayClonePanel() {
    document.getElementById("add-repository-panel").style.zIndex = "10";
    $("#open-local-repository").hide();
}

function displayFilePanel() {
    document.getElementById("file-panel").style.zIndex = "10";
}

function displayGraphPanel() {
    document.getElementById("graph-panel").style.zIndex = "10";
}

function displayAddRepositoryPanel() {
    document.getElementById("add-repository-panel").style.zIndex = "10";
    $("#open-local-repository").show();
}

function hideFilePanel() {
    document.getElementById("file-panel").style.zIndex = "-10";
}

function hideGraphPanel() {
    document.getElementById("graph-panel").style.zIndex = "-10";
}

function hideAddRepositoryPanel() {
    document.getElementById("add-repository-panel").style.zIndex = "-10";
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

function hideAuthenticatePanel() {
    document.getElementById("authenticate").style.zIndex = "-20";
}

export function displayAuthenticatePanel() {
    document.getElementById("authenticate").style.zIndex = "20";
}

function displayDiffPanelButtons() {
    document.getElementById("save-button").style.visibility = "visible";
    document.getElementById("cancel-button").style.visibility = "visible";
}

function hideDiffPanelButtons() {
    document.getElementById("save-button").style.visibility = "hidden";
    document.getElementById("cancel-button").style.visibility = "hidden";
    disableSaveCancelButton();
    disableDiffPanelEditOnHide();
}

function disableSaveCancelButton() {
    const saveButton = document.getElementById("save-button");
    const cancelButton = document.getElementById("cancel-button");
    saveButton.disabled = true;
    saveButton.style.backgroundColor = gray;
    cancelButton.disabled = true;
    cancelButton.style.backgroundColor = gray;
}

function enableSaveCancelButton() {
    const saveButton = document.getElementById("save-button");
    const cancelButton = document.getElementById("cancel-button");
    saveButton.disabled = false;
    saveButton.style.backgroundColor = blue;
    cancelButton.disabled = false;
    cancelButton.style.backgroundColor = blue;
}

function disableDiffPanelEditOnHide() {
    const doc = document.getElementById("diff-panel-body");
    doc.contentEditable = "false";
}
