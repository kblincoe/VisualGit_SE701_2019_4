import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import * as $ from "jquery";

import { AuthenticationService } from "../services/authentication/authentication.service";
import { CredentialsStoreService } from "../services/credentials-store/credentials-store.service";
import { RepositoryService} from "../services/repository.service";
import { ThemeService } from "../services/theme.service";
import { UserService } from "../services/user/user.service";
import { FileService } from "../services/file.service";

@Component({
    selector: "my-app",
    templateUrl: "./app.component.html",
    providers: [],
})

export class AppComponent {

    constructor(private themeService: ThemeService) {

        ipcRenderer.on("change-to-white-style", () => {
            this.themeService.setTheme("white")
        });

        ipcRenderer.on("change-to-pink-style", () => {
            this.themeService.setTheme("pink");
        });

        ipcRenderer.on("change-to-blue-style", () => {
            this.themeService.setTheme("blue");
        });

        ipcRenderer.on("change-to-navy-style", () => {
            this.themeService.setTheme("navy");
        });

        ipcRenderer.on("change-to-green-style", () => {
            this.themeService.setTheme("green");
        });

        ipcRenderer.on("change-to-default-style", () => {
            this.themeService.setTheme("default");
        });

        $("#repo-modal").on("hidden.bs.modal", function (e) {
            console.log("app.components.ts, Line 47. Message is: " + e);
            const cloneButton = document.getElementById("cloneButton");
            cloneButton.innerHTML = "Clone";
            cloneButton.setAttribute("class", "btn btn-primary disabled");
        });

    }
}
