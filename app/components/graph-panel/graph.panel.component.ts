import { Component, OnInit } from "@angular/core";
import { mergeCommits, rebaseCommits } from "../../misc/git";
import { RepositoryService } from "../../services/repository.service"
import { displayBranch, changeRepoName, changeBranchName } from "../../misc/repo"
import { drawGraph } from "../../misc/graphSetup";



@Component({
    selector: "graph-panel",
    templateUrl: "./graph.panel.component.html",
})

export class GraphPanelComponent implements OnInit {

    constructor(private repoService: RepositoryService ) {}

    public ngOnInit() {

        if (this.repoService.getCurrentRepo()) {
            this.repoService.refreshBranches();
        }
    }

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
