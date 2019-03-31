import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
 
import { AppComponent } from './components/app.component';
import { AddRepositoryComponent } from "./components/add-repository/add.repository.component";
import { AuthenticateComponent } from "./components/authenticate/authenticate.component";
import { BodyPanelComponent } from "./components/body-panel/body.panel.component";
import { FilePanelComponent } from "./components/file-panel/file.panel.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";


@NgModule({
  declarations: [
    AppComponent,
    AddRepositoryComponent,
    AuthenticateComponent,
    BodyPanelComponent,
    FilePanelComponent,
    FooterComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }