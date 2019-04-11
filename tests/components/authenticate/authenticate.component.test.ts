require("reflect-metadata");
jest.mock("nodegit");
jest.mock("electron");
import { AuthenticateComponent } from "../../../app/components/authenticate/authenticate.component";
import { AuthenticationService } from "../../../app/services/authentication/authentication.service";

describe("Component: Authenticate", () => {

    beforeEach(() => {
        this.userService = jest.mock("../../../app/services/user/user.service");
        this.ngRouter = jest.mock("@angular/router");
        this.ngLocation = jest.fn();
        this.authenticationService = new AuthenticationService(this.userService);
        this.credentialsStoreService = jest.fn();
        this.settingsService = jest.fn();
        this.themeService = jest.fn();
        this.popUpService = jest.fn();
        this.component = new AuthenticateComponent(
            this.authenticationService, this.credentialsStoreService,
            this.userService, this.ngRouter,
            this.ngLocation, this.themeService,
            this.popUpService);
    });

    it("should switch to AddRepositoryPanel when login is successul", (done) => {
        let mockPromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
            resolve(true);
        });
        jest.spyOn(this.authenticationService, "logIn").mockReturnValue(mockPromise);
        jest.spyOn(this.component, "switchToAddRepositoryPanel").mockImplementation(() => { });

        this.component.logIn();

        mockPromise.then((result) => {
            expect(this.component.switchToAddRepositoryPanel).toHaveBeenCalled();
            done();
        });
    });

    it("should display warning when login is unsuccessul", (done) => {
        let mockPromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
            reject("error");
        });
        jest.spyOn(this.authenticationService, "logIn").mockReturnValue(mockPromise);
        jest.spyOn(this.component, "displayWarning").mockImplementation(() => { });

        this.component.logIn();

        mockPromise.catch((error) => {
            expect(this.component.displayWarning).toHaveBeenCalled();
            done();
        });
    });
});
