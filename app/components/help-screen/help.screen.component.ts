import { Component } from "@angular/core";
import { Location } from "@angular/common";

@Component({
    selector: "help-screen",
    templateUrl: "./help.screen.component.html",
    providers: [],
})

export class HelpScreenComponent {

    constructor(private location: Location) {}

    public goBack(): void {
        this.location.back();
    }

}
