import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import * as $ from "jquery";

import { AuthenticationService } from "../services/authentication/authentication.service";
import { CredentialsStoreService } from "../services/credentials-store/credentials-store.service";
import { ThemeService } from "../services/theme.service";

@Component({
    selector: "my-app",
    templateUrl: "./app.component.html",
    providers: [ AuthenticationService, CredentialsStoreService ]
})

export class AppComponent {

    constructor(private themeService: ThemeService) {


        ipcRenderer.on('change-to-white-style', () => {
            this.themeService.setTheme('white')
        });

        ipcRenderer.on('change-to-pink-style', () => {
            this.themeService.setTheme('pink');
        });

        ipcRenderer.on('change-to-blue-style', () => {
            this.themeService.setTheme('blue');
        });

        ipcRenderer.on('change-to-navy-style', () => {
            this.themeService.setTheme('navy');
        });

        ipcRenderer.on('change-to-green-style', () => {
            this.themeService.setTheme('green');
        });

        ipcRenderer.on('change-to-default-style', () => {
            this.themeService.setTheme('default');
        });

        
        $('#repo-modal').on('hidden.bs.modal', function (e) {
            console.log(e);
            var butt = document.getElementById("cloneButton");
            butt.innerHTML = 'Clone';
            butt.setAttribute('class', 'btn btn-primary disabled');
        });

    }
}
