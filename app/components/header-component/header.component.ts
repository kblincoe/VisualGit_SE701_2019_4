import { Component } from "@angular/core";
import { GraphService } from "../services/graph.service";
import { RepositoryService } from "../services/repository.service";

@Component({
  selector: "app-header",
  templateUrl: "header.component.html",
  providers: [RepositoryService, GraphService],
})

export class HeaderComponent   {
  public repoName: string = "Repo name";
  public repoBranch: string = "Repo branch";
  public repository: any;

  public promptUserToAddRepository(): void {
    switchToAddRepositoryPanel();
  }

  public switchToMainPanel(): void {
    signInHead(collpaseSignPanel);
  }

  public WarningSignIn(): void {
    redirectToHomePage();
  }

}
