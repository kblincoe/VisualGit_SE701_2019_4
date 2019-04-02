require("reflect-metadata");
import { AuthenticateComponent } from "../../../app/components/authenticate/authenticate.component";
import { AuthenticationService } from "../../../app/services/authentication/authentication.service";
import { CredentialsStoreService } from "../../../app/services/credentials-store/credentials-store.service";
import { ThemeService } from "../../../app/services/theme.service";

describe("Component: Authenticate", () => {

    beforeEach(() => {
        this.credentialsStoreService = new CredentialsStoreService();
        this.authenticationService = new AuthenticationService();
        this.router = jest.mock("@angular/router");
        this.location = jest.mock("@angular/common");
        this.router = new ThemeService();
        this.component = new AuthenticateComponent(this.authenticationService,
            this.credentialsStoreService, this.router, this.location, this.service);
    });

    it("should switch to AddRepositoryPanel when login is successul", (done) => {
        let mockPromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
            resolve(true);
        });
        jest.spyOn(this.authenticationService, "logIn").mockReturnValue(mockPromise);
        jest.spyOn(this.component, "switchToAddRepositoryPanel").mockImplementation(() => {});

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
        jest.spyOn(this.component, "displayWarning").mockImplementation(() => {});

        this.component.logIn();

        mockPromise.catch((error) => {
            expect(this.component.displayWarning).toHaveBeenCalled();
            done();
        });
    });
});