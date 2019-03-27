let fileLocation;
import * as fs from "fs";
import { displayModal, repoFullPath } from "./repo";
import { hideDiffPanel } from "./router";

function readFromFile(filePath) {
    fileLocation = require("path").join(repoFullPath, filePath);

    const lineReader = require("readline").createInterface({
        input: fs.createReadStream(fileLocation),
    });

    const doc = document.getElementById("diff-panel-body");
    lineReader.on("line", function (line) {
        appendLineToDoc(doc, line);
    });
}

function appendLineToDoc(doc, line) {
    const element = document.createElement("div");
    element.textContent = line;
    doc.appendChild(element);
}

export function saveFile() {
    const fileContent = generateFileContent();
    fs.writeFile(fileLocation, fileContent, "utf8", function (err) {
        if (err) { throw err; }
        saveSuccess();
    });
}

function generateFileContent() {
    const doc = document.getElementById("diff-panel-body");
    const children = doc.childNodes;

    let content = "";
    children.forEach(function (child) {
        content += child.textContent + "\n";
    });
    return content;
}

function saveSuccess() {
    displayModal("File saved!");
}

export function cancelEdit() {
    hideDiffPanel();
}
