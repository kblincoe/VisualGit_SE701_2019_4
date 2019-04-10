require("reflect-metadata");
import { PopupService } from "../../../app/services/popup/popup.service";

describe("Service: Popup", () => {
    let popupService: PopupService;
    const duration1 = 500;
    const duration2 = 300;

    const text1 = "hello";
    const text2 = "hi";

    // Maximum amount of variation allowed in timing
    // (code takes some time to execute so timings won't be ms perfect)
    const maxVariation = 30;

    beforeEach(() => {
        popupService = new PopupService();
    });

    it("should display for given duration, then dissapear", (done) => {
        popupService.showInfo(text1, undefined, duration1);

        expect(popupService.HidePopup).toBe(false);
        expect(popupService.PopupText).toBe(text1);

        setTimeout(() => {
            expect(popupService.HidePopup).toBe(false);
        }, duration1 - maxVariation);

        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
            done();
        }, duration1 + maxVariation);
    });

    it("should display in order that popups are added", (done) => {

        popupService.showInfo(text1, undefined, duration1);
        popupService.showInfo(text2, undefined, duration2);

        // Show first popup
        expect(popupService.HidePopup).toBe(false);
        expect(popupService.PopupText).toBe(text1);

        // Show until duration ends
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(false);
            expect(popupService.PopupText).toBe(text1);
        }, duration1 - maxVariation);

        // Hide first popup
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
        }, duration1 + maxVariation);

        // Hide first popup until time between popups
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
        }, duration1 + PopupService.TimeBetweenPopups - maxVariation);

        // Show second popup
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(false);
            expect(popupService.PopupText).toBe(text2);
        }, duration1 + PopupService.TimeBetweenPopups + maxVariation);

        // Show second popup until second duration
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(false);
            expect(popupService.PopupText).toBe(text2);
        }, duration1 + PopupService.TimeBetweenPopups + duration2 - maxVariation);

        // Hide second popup
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
            done();
        }, duration1 + PopupService.TimeBetweenPopups + duration2 + maxVariation);
    });

    it("should cancel second popup when cancellation token is used", (done) => {

        popupService.showInfo(text1, undefined, duration1);
        const cancel = popupService.showInfo(text2, undefined, duration2);

        // Show first popup
        expect(popupService.HidePopup).toBe(false);
        expect(popupService.PopupText).toBe(text1);

        // Show until duration ends
        setTimeout(() => {
            cancel();
            expect(popupService.HidePopup).toBe(false);
            expect(popupService.PopupText).toBe(text1);
        }, duration1 - maxVariation);

        // Hide first popup
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
        }, duration1 + maxVariation);

        // Hide first popup until time between popups
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
        }, duration1 + PopupService.TimeBetweenPopups - maxVariation);

        // Don't show second popup
        setTimeout(() => {
            expect(popupService.HidePopup).toBe(true);
            done();
        }, duration1 + PopupService.TimeBetweenPopups + maxVariation);
    });

});
