import { Component, OnInit } from "@angular/core";
import { ThemeService } from "../../services/theme.service";
import { refreshRepo } from "../../misc/repo";

@Component({
    selector: "main-panel",
    templateUrl: "./main-panel.component.html",
})

export class MainPanelComponent implements OnInit {

    constructor(private themeService: ThemeService) {}

    ngOnInit() {
        refreshRepo();
        this.themeService.setColors();

    }
}
