import { Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { PopupService } from "../../services/popup/popup.service";

export enum PopupStyles {
    Error, Info,
}

@Component({
    selector: "popup",
    templateUrl: "./popup.component.html",
})
export class PopupComponent {
    @ViewChild("popupHost", {read: ViewContainerRef}) public popupHost: ViewContainerRef;
    @ViewChild("overlay") public overlay: ElementRef;
    public hideOverlay = true;

    // For access in html template
    public PopupStyles = PopupStyles;

    constructor(public popupService: PopupService, private componentFactoryResolver: ComponentFactoryResolver) {
        popupService.setPopupComponent(this);
    }

    public addPopup(component) {
        this.hideOverlay = false;

        // wait until the ng-template gets rendered
        setTimeout(() => {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
            this.popupHost.clear();
            this.popupHost.createComponent(componentFactory);
        });
    }

    public dismissPopup(event: MouseEvent) {
        // Check if the overlay was clicked specifically (not something that is a child of the overlay)
        const eventTargetId = (event.target as HTMLElement).id;
        if (eventTargetId === "popup-overlay" || eventTargetId === "popup-main") {
            this.hideOverlay = true;
        }
    }

}