import { Injectable } from "@angular/core";
import { PopupComponent, PopupStyles } from "../../components/popup/popup.component";

@Injectable()
export class PopupService {
    public static TimeBetweenPopups = 200;

    public get PopupText() {
        return this.popupText;
    }

    public get HidePopup() {
        return this.hidePopup;
    }

    public get PopupStyle() {
        return this.popupStyle;
    }

    private popupText: string;
    private hidePopup = true;
    private popupStyle: PopupStyles;

    private popupComponent: PopupComponent;

    private popupPromise: Promise<void>;

    public setPopupComponent(popupComponent: PopupComponent) {
        this.popupComponent = popupComponent;
    }

    // Shows a custom popup with the given angular component
    public showCustomPopup(component): void {
        this.popupComponent.addPopup(component);
    }

    // Displays an informational popup with the given text (optional style and duration - default duration being 2000ms)
    public showInfo = (text: string, style?: PopupStyles, duration = 2000): () => void => {
        if (!this.popupPromise) {
            // No popups showing - setup the promise
            this.popupPromise = this.setPopupField(text, style, duration);
        } else {
            let cancelled = false;
            const newPromise = this.popupPromise.then(async () => {
                if (cancelled) {
                    return;
                }

                // Wait before showing the next popup
                await this.delay(PopupService.TimeBetweenPopups);

                await this.setPopupField(text, style, duration);
            });

            this.popupPromise = newPromise;

            return () => {
                cancelled = true;
            };
        }
    }

    // Sets up all the fields needed for a popup
    private setPopupField = (text: string, style: PopupStyles, duration: number): Promise<void> => {
        return new Promise(async (resolve) => {
            this.hidePopup = false;
            this.popupText = text;
            this.popupStyle = style;
            await this.delay(duration);

            this.hidePopup = true;
            resolve();
        });
    }

    // Returns a promise that completes after the given ms milliseconds
    private delay = (ms: number): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
}