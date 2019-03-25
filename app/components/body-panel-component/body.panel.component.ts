import { Component } from "@angular/core";
import { DiffPanelComponent } from "../diff.panel.component/diff.panel.component";
import { GraphPanelComponent } from "../graph.panel.component/graph.panel.component";

@Component({
  selector: "body-panel",
  templateUrl: "body.panel.component.html",
  directives: [DiffPanelComponent, GraphPanelComponent],
})

export class BodyPanelComponent {

}
