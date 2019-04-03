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
import { CloneRepositoryComponent } from "./components/clone-repository/clone.repository.component";
import { UserService } from "./services/user/user.service";
import { AuthenticationService } from "./services/authentication/authentication.service";
import { CredentialsStoreService } from "./services/credentials-store/credentials-store.service";
import { ThemeService } from "./services/theme.service";

@NgModule({
    declarations: [
        AppComponent,
        SelectRepositoryComponent,
        CloneRepositoryComponent,
        AddRepositoryComponent,
        AuthenticateComponent,
        BodyPanelComponent,
        RootPanelComponent,
        MainPanelComponent,
        FilePanelComponent,
        FooterComponent,
        HeaderComponent
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
                                { path: "clone", component: CloneRepositoryComponent }
                            ],
                        },
                    ],
                },

            ]),
    ],
    providers: [UserService, AuthenticationService, CredentialsStoreService, ThemeService],
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
