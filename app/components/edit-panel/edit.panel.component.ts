import { EventEmitter } from "@angular/common/src/facade/async";
import { Component, ElementRef, Input, OnInit, Output, ViewChild } from "@angular/core";
const fs = require("fs");
const readline = require("readline");

@Component({
    selector: "edit-panel",
    templateUrl: "./edit.panel.component.html",
})

export class EditPanelComponent implements OnInit {
    @Input() public filename: string;
    @Output() public finishEdit = new EventEmitter();

    @ViewChild("editPanel") public editPanel: ElementRef;

    public ngOnInit(): void {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(this.filename),
        });

        lineReader.on("line", (line) => {
            this.addLine(line);
        });
    }

    public saveFile() {
        let textContent = "";
        this.processLines((node) => {
            textContent += (textContent !== "" ? "\n" : "") + node.textContent;
        });

        fs.writeFile(this.filename, textContent, (err) => {
            if (err) {
                return console.error(err);
            }
        });

        this.finishEdit.emit();
    }

    public cancelEdit() {
        this.finishEdit.emit();
    }

    private addLine = (line: string): void => {
        // Done natively for performance reasons
        const nativePanel = this.editPanel.nativeElement as HTMLDivElement;
        const element = document.createElement("div");
        element.innerText = line;
        if (line === "") {
            element.innerHTML = "<br>";
        }
        nativePanel.appendChild(element);
    }

    private processLines = (callback: (node: Node) => void) => {
        const diffBodyNative = this.editPanel.nativeElement as HTMLDivElement;
        diffBodyNative.childNodes.forEach((node) => {
            if (node.nodeType === Node.COMMENT_NODE) {
                return;
            }

            // No line should have a newline character inside it (divs and <br> are used for that)
            if (node.textContent.search("\\n") > -1) {
                return;
            }

            callback(node);
        });
    }

}
