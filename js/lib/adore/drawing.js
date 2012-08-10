// adore/drawing.js contains all the function to draw nodes and edges.

define(["require", "jquery", "jsPlumb"], function (require, $, jsPlumb) {
    "use strict";

    // We set some default settings for our jsPlumb instance.
    jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Connector: [ "Straight" ],
        Endpoints: [ "Blank", "Blank" ]
    });

    // If the window gets resized, jsPlump needs to repaint all the SVG edges.
    $(window).resize(function () {
        jsPlumb.repaintEverything();
    });

    // This function draws the given edge. Expects an edge object from the JSON data set like
    //
    //     {
    //       "id"    : "edge1",
    //       "from"  : { "id" : "author2", ... },
    //       "to"    : { "id" : "paperA", ... },
    //       "class" : "authorship"
    //     }
    //
    // and the ID of the path the two nodes are on.
    function drawEdge(edge, pathID) {
        console.log("adore: drawing edge from " + pathID + "-" + edge.from.id + " to " +
            pathID + "-" + edge.to.id);

        jsPlumb.connect({
            source: pathID + "-" + edge.from.id,
            target: pathID + "-" + edge.to.id,
            cssClass: edge["class"],
            overlays: [
                [ "Label", { label: edge["class"], cssClass: edge["class"] + " label" } ],
                [ "Label", { label: "", cssClass: edge["class"] + " icon" } ]
            ]
        });
    }

    // This function creates a `<div>` for a single source or target node.
    // Expects a node object from the JSON data set like
    //
    //     {
    //       "id"    : "author2",
    //       "label" : "Author 2",
    //       "class" : "author"
    //     }
    //
    // and the ID of the path that contains the node.
    function makeNodeDiv(node, pathID) {
        return $("<div/>")
            .addClass("node")
            .addClass(node["class"])
            .attr("id", pathID + "-" + node.id)
            .data("pathID", pathID)
            .data("nodeID", node.id)
            .append($("<div/>").addClass("label").text(node.label));
    }

    // This function positions the single nodes that form a path in suitable way.
    // All nodes are distributed on the available space evenly.
    // Expects the jQuery object that represents the path `<div>`.
    function positionNodesOnPath(pathDiv) {
        var nodeDivs = pathDiv.children(".node");

        nodeDivs.each(function (index) {
            $(this).css("left",
                ((100 / nodeDivs.length * (index + 1)) - 100 / nodeDivs.length / 2).toString() + "%");
        });
    }

    // This function creates a `<div>` for a single path from the JSON dataset,
    // subsequently adding child-`<div>`'s for all source and target nodes as well.
    // Expects a path object from the JSON data set like
    //
    //     {
    //       "id": "path1",
    //       "edges":
    //         [
    //           { "id": "edge1", ... },
    //           { "id": "edge3", ... },
    //           ...
    //         ]
    //     }
    //
    function makePathDiv(path) {
        var pathDiv = $("<div/>")
            .addClass("path")
            .attr("id", path.id);

        // We iterate through all edges and create a new `div` for each source node.
        for (var i = 0, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            var currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from, path.id));
        }

        // For the last edge, we also create the target node.
        pathDiv.append(makeNodeDiv(path.edges[path.edges.length - 1].to, path.id));

        return pathDiv;
    }

    function repaint() {
        jsPlumb.repaintEverything();
    }

    // This function draws all paths from the JSON dataset and returns a path `div`
    // that can easily be appended to a DOM element with jQuery.
    function drawFromJson(validationCallback) {
        // First we validate the JSON instance against our JSON schema.
        //validateJsonData(validationCallback);

        var state = require("adore/base").getState();

        // We iterate through all paths, create a new path `div` and append it to the drawing area.
        for (var i = 0; i < state.pathCount; i += 1) {
            var pathDiv = makePathDiv(state.jsonData.paths[i]);

            // We position the nodes on the path.
            positionNodesOnPath(pathDiv);

            // We hide all but the first path.
            if (i > 0) {
                $(pathDiv).hide();
            }
        }

        // We are finished. We store the current path index.
        if (pathCount > 0) {
            require("adore/base").setState({
                activePathIndex: 0
            });
        }

        return pathDiv;
    }

    function drawEdges {
        // We draw all edges. Only the edges of the currently visible path on screen
        // will be visible.
        for (var j = 0; j < state.pathCount; j += 1) {
            var currPath = state.jsonData.paths[j],
                edgeCount = currPath.edges.length;

            for (var k = 0; k < edgeCount; k += 1) {
                drawEdge(currPath.edges[k], currPath.id);
            }
        }
    }

    return {
        drawFromJson: drawFromJson,
        drawEdges: drawEdges,
        repaint: repaint
    };
});