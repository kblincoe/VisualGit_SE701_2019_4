require("reflect-metadata");
jest.mock("nodegit");
jest.mock("electron");
import { AddRepositoryComponent } from '../../../app/components/add-repository/add.repository.component';

let path = require("path");

describe("Component: Authenticate", () => {
    beforeAll(() => {
        this.router = jest.mock('@angular/router');
        this.themeService = jest.mock('../../../app/services/theme.service');
        this.repositoryService = jest.mock('../../../app/services/repository.service');
        this.userService = jest.mock('../../../app/services/user/user.service');
        this.component = new AddRepositoryComponent(
            this.router,
            this.themeService,
            this.repositoryService,
            this.userService
        );
    });

    test("valid git url", () => {
        this.component.cloneURL = 'https://abc.com/user/repo.git';
        this.component.setPresetPath();
        expect(this.component.saveDirectory).toBe(path.join(process.cwd(), 'repo'));
    });

    test("invalid git url", () => {
        this.component.cloneURL = 'https://abc.com/user/';
        this.component.setPresetPath();
        expect(this.component.saveDirectory).toBe('');
    });
});