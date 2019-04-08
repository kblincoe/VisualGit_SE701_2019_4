import { BrowserModule } from "@angular/platform-browser";
import { NgModule, Injector } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./components/app.component";
import { AddRepositoryComponent } from "./components/add-repository/add.repository.component";
import { AuthenticateComponent } from "./components/authenticate/authenticate.component";
import { BodyPanelComponent } from "./components/body-panel/body.panel.component";
import { FilePanelComponent } from "./components/file-panel/file.panel.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { RouterModule } from "@angular/router";
import { MainPanelComponent } from "./components/main-panel/main-panel.component";
import { RootPanelComponent } from "./components/root-panel/root-panel.component";
import { SelectRepositoryComponent } from "./components/select-repository/select.repository.component";
import { UserService } from "./services/user/user.service";
import { AuthenticationService } from "./services/authentication/authentication.service";
import { CredentialsStoreService } from "./services/credentials-store/credentials-store.service";
import { ThemeService } from "./services/theme.service";
import { SettingsService } from "./services/settings.service";
import { EditPanelComponent } from './components/edit-panel/edit.panel.component';
import { DiffService } from './services/diff-service/diff-service';
import { RepositoryService } from "./services/repository.service";
import { FileService } from "./services/file.service";
import { PopupService } from "./services/popup/popup.service";
import { PopupComponent } from "./components/popup/popup.component";

@NgModule({
    declarations: [
        AppComponent,
        SelectRepositoryComponent,
        AddRepositoryComponent,
        AuthenticateComponent,
        BodyPanelComponent,
        RootPanelComponent,
        MainPanelComponent,
        FilePanelComponent,
        FooterComponent,
        HeaderComponent,
        EditPanelComponent,
        PopupComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(
            [
                { path: "", component: AuthenticateComponent },
                {
                    path: "panel", component: RootPanelComponent, children: [
                        { path: "main", component: MainPanelComponent },
                        {
                            path: "repository", component: SelectRepositoryComponent, children: [
                                { path: "add", component: AddRepositoryComponent },
                            ],
                        },
                    ],
                },

            ]),
    ],
    providers: [UserService, AuthenticationService, CredentialsStoreService, DiffService, ThemeService, SettingsService, RepositoryService, FileService, PopupService],
    bootstrap: [AppComponent],
})

export class AppModule {
    /**
     * Allows for retrieving singletons using `AppModule.injector.get(MyService)`
     * This is used by git.ts and repo.ts global functions to retreive username and passwords.
     * This shall be removed once those files are refactored into services.
     */
    public static injector: Injector;

    constructor(injector: Injector) {
        AppModule.injector = injector;
    }
}
