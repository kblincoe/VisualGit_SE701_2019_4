import { Component } from "@angular/core";
import { mergeCommits, rebaseCommits } from "../../misc/git";

@Component({
    selector: "graph-panel",
    templateUrl: "./graph.panel.component.html",
})

export class GraphPanelComponent {
    public mergeBranches(): void {
        const p1 = document.getElementById("fromMerge").innerHTML;
        mergeCommits(p1);
    }

    public rebaseBranches(): void {
        const p1 = document.getElementById("fromRebase").innerHTML;
        const p2 = document.getElementById("toRebase").innerHTML;
        rebaseCommits(p1, p2);
    }
}
