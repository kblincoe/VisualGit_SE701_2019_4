import { getGithubPage, sendEmail } from "../../app/misc/profile";

describe("Profile interaction: Popup", () => {
    it("should popup a window", (done) => {
        const windowOpenSpy = spyOn(window, 'open');
        getGithubPage("");
        expect(windowOpenSpy).toHaveBeenCalledWith("https://www.github.com/");
        done();
    });
})