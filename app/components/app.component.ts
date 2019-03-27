import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import * as $ from "jquery";
import { AddRepositoryComponent } from "./add-repository/add.repository.component";
import { AuthenticateComponent } from "./authenticate/authenticate.component";
import { BodyPanelComponent } from "./body-panel/body.panel.component";
import { FilePanelComponent } from "./file-panel/file.panel.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { changeColor } from "../misc/color";
import { displayModifiedFiles, addAndCommit } from "../misc/git";
import { saveFile, cancelEdit } from "../misc/file";
import { AuthenticationService } from "../services/authentication/authentication.service";
import { CredentialsStoreService } from "../services/credentials-store/credentials-store.service";

@Component({
    selector: "my-app",
    templateUrl: "./app.component.html",
    providers: [AuthenticationService, CredentialsStoreService],
    directives: [HeaderComponent, FilePanelComponent, BodyPanelComponent, FooterComponent, AddRepositoryComponent, AuthenticateComponent],
})

export class AppComponent {

    constructor() {

        ipcRenderer.on('change-to-white-style', function () {
            changeColor('white');
        });

        ipcRenderer.on('change-to-pink-style', function () {
            changeColor('pink');
        });

        ipcRenderer.on('change-to-blue-style', function () {
            changeColor('blue');
        });

        ipcRenderer.on('change-to-navy-style', function () {
            changeColor('navy');
        });

        ipcRenderer.on('change-to-green-style', function () {
            changeColor('green');
        });

        ipcRenderer.on('change-to-default-style', function () {
            changeColor('default');
        });

        setTimeout(function () {
            // Add click event to Commit button
            document.getElementById('commit-button').addEventListener("click", function () {
                console.log("clicked");
                addAndCommit();
            });

            document.getElementById('save-button').addEventListener("click", function () {
                saveFile();
            });

            document.getElementById('cancel-button').addEventListener("click", function () {
                cancelEdit();
            });

        }, 2000);

        // Update modified files on left file panel every X seconds
        setInterval(function () {
            displayModifiedFiles();
        }, 3000);

        $('#repo-modal').on('hidden.bs.modal', function (e) {
            console.log(e);
            var butt = document.getElementById("cloneButton");
            butt.innerHTML = 'Clone';
            butt.setAttribute('class', 'btn btn-primary disabled');
        });

    }
}
