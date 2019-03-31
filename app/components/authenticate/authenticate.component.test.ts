import "reflect-metadata";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { CredentialsStoreService } from "../../services/credentials-store/credentials-store.service";
import { AuthenticateComponent } from "./authenticate.component";

describe("Component: Authenticate", () => {

    beforeEach(() => {
        this.credentialsStoreService = new CredentialsStoreService();
        this.authenticationService = new AuthenticationService();
        this.component = new AuthenticateComponent(this.authenticationService, this.credentialsStoreService);
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
