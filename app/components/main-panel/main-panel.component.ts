import { Component, OnInit } from "@angular/core";
import { ThemeService } from "../../services/theme.service";
import { RepositoryService } from "../../services/repository.service"

@Component({
    selector: "main-panel",
    templateUrl: "./main-panel.component.html",
})

export class MainPanelComponent implements OnInit {

    constructor(private themeService: ThemeService,
                private repoService: RepositoryService) {}

    ngOnInit() {
        this.repoService.refreshRepo();
        this.themeService.setColors();
    }
}
