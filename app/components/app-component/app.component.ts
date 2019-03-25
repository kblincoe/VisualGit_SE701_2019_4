import { Component } from "@angular/core";
import { AddRepositoryComponent } from "../add.repository.component/add.repository.component";
import { AuthenticateComponent } from "../authenticate.component/authenticate.component";
import { BodyPanelComponent } from "../body.panel.component/body.panel.component";
import { FilePanelComponent } from "../file.panel.component/file.panel.component";
import { FooterComponent } from "../footer.component/footer.component";
import { HeaderComponent } from "../../header.component/header.component";

@Component({
  selector: "my-app",
  templateUrl: "app.component.html",
  directives: [HeaderComponent, FilePanelComponent, BodyPanelComponent, FooterComponent, AddRepositoryComponent, AuthenticateComponent],
})

export class AppComponent { }
