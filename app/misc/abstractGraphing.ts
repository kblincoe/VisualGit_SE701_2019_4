import { imageForUser } from "./images";
import * as Git from "nodegit";
import { GraphingUtils, commitHistory, spacingY, spacingX, getNodeId, nextFreeColumn, sortCommits, makeNode, timeCompare, reCenter } from "./graphing";

let vis = require("vis");

function processAbstract(commits: Git.Commit[]) {
    sortCommits(commits);
    populateAbstract();
}

function populateAbstract() {
    // reset variables for idempotency, shouldn't be needed when a class is created instead
    GraphingUtils.nodeId = 1;
    GraphingUtils.commitList = [];
    GraphingUtils.parentCount = {};
    GraphingUtils.columns = [];
    // Sort
    // commitHistory = commits.sort(function(a, b) {
    //   return a.timeMs() - b.timeMs();
    // });

    // Plot the graph
    for (let i = 0; i < commitHistory.length; i++) {
        console.log(i + " / " + commitHistory.length);
        const parents: string[] = commitHistory[i].parents();
        let nodeColumn;
        for (let j = 0; j < parents.length; j++) {
            const parent = parents[j];
            if (!(parent in GraphingUtils.parentCount)) {
                GraphingUtils.parentCount[parent] = 1;
            } else {
                GraphingUtils.parentCount[parent]++;
            }
        }
        if (parents.length === 0) {
            // no parents means first commit so assign the first column
            GraphingUtils.columns[0] = true;
            nodeColumn = 0;
        } else if (parents.length === 1) {
            const parent = parents[0];
            const parentId = getNodeId(parent.toString());
            const parentColumn = GraphingUtils.commitList[parentId - 1].column;
            if (GraphingUtils.parentCount[parent] === 1) {
                // first child
                nodeColumn = parentColumn;
            } else {
                nodeColumn = nextFreeColumn(parentColumn);
            }
        } else {
            let desiredColumn: number = -1;
            let desiredParent: string = "";
            const freeableColumns: number[] = [];

            for (let j = 0; j < parents.length; j++) {
                const parent: string = parents[j];
                const parentId = getNodeId(parent.toString());
                const proposedColumn = GraphingUtils.commitList[parentId - 1].column;

                if (desiredColumn === -1 || desiredColumn > proposedColumn) {
                    desiredColumn = proposedColumn;
                    desiredParent = parent;
                } else {
                    freeableColumns.push(proposedColumn);
                }

            }
            for (let k = 0; k < freeableColumns.length; k++) {
                const index = freeableColumns[k];
                GraphingUtils.columns[index] = false;
            }
            if (GraphingUtils.parentCount[desiredParent] === 1) {
                // first child
                nodeColumn = desiredColumn;
            } else {
                nodeColumn = nextFreeColumn(desiredColumn);
            }
        }

        makeNode(commitHistory[i], nodeColumn);
    }

    // Add edges
    for (let i = 0; i < commitHistory.length; i++) {
        addEdges(commitHistory[i]);
    }

    GraphingUtils.commitList = GraphingUtils.commitList.sort(timeCompare);
    reCenter();
}

function addEdges(c) {
    const parents = c.parents();
    if (parents.length !== 0) {
        parents.forEach(function (parent) {
            const sha: string = c.sha();
            const parentSha: string = parent.toString();
            makeEdge(sha, parentSha);
        });
    }
}

function getEmail(c) {
    const stringer = c.author().toString().replace(/</, "%").replace(/>/, "%");
    const email = stringer.split("%")[1];
    return email;
}

function makeAbsNode(c, column: number, count: number) {
    const id = GraphingUtils.nodeId++;
    const name = "Node " + id;
    let reference;
    const email = getEmail(c);
    const title = "Author: " + email + "<br>" + "Number of Commits: " + count;
    nodes.add({
        id,
        shape: "circularImage",
        title,
        image: imageForUser(name, email, () => { }),
        physics: false,
        fixed: (id === 1),
        x: (column - 1) * spacingX,
        y: (id - 1) * spacingY,
    });
    GraphingUtils.commitList.push({
        sha: c.sha(),
        id,
        time: c.timeMs(),
        column,
        email,
        reference,
    });
}

function makeEdge(sha: string, parentSha: string) {
    const fromNode = getNodeId(parentSha.toString());
    const toNode = getNodeId(sha);

    edges.add({
        from: fromNode,
        to: toNode,
    });
}
