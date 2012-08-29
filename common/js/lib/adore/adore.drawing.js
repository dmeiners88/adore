;(function (namespace, undefined) {
    "use strict";

    // We extend the adore namespace with adore.drawing.
    namespace.drawing = namespace.drawing || {};

    // We store a local reference to save lookup times.
    var drawing = namespace.drawing;

    // We wait for jsPlumb being ready.
    jsPlumb.ready(function () {

        // We set some default settings for our jsPlumb instance.
        jsPlumb.importDefaults({
            Anchor: "AutoDefault",
            Connector: [ "Straight" ],
            Endpoints: [ "Blank", "Blank" ]
        });

        // If the window gets resized, jsPlump needs to repaint all the SVG edges.
        $(window).resize(repaint);

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
            var src, dest, alternate = {};

            if (pathID.hasOwnProperty("src")) {
                src = pathID.src;
                dest = pathID.dest;
                alternate = { connector: [ "Bezier", { curviness: 250 } ] };
            } else {
                src = pathID;
                dest = pathID;
            }

            console.log("adore: drawing edge from " + src + "-" + edge.from.id + " to " +
                    dest + "-" + edge.to.id);

            jsPlumb.connect({
                source: src + "-" + edge.from.id,
                target: dest + "-" + edge.to.id,
                cssClass: edge["class"],
                overlays: [
                    [ "Label", { label: edge["class"] + (!edge.label || (" (" + edge.label + ")").toString()), cssClass: edge["class"] + " class" } ],
                    [ "Label", { label: "", cssClass: edge["class"] + " icon" } ]
                ]
            }, alternate);
        }

        // This function creates and returns a `<div>` for a single source or target node.
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

        // This is a helper function for switchToMultiPathView, that merges the source and target nodes,
        // that are common to all paths. To achieve this impression, we hide all source and target nodes
        // but the ones on the "middle" path. Than we replace the relevant edges.
        function mergeSourceAndTargetNodes() {
            var state = adore.state,
                config = adore.config,
                paths = config.drawingArea.children(),
                newTop;

            if (!state.jsonData.hasOwnProperty("paths")) {
                return;
            }

            // We determine the new top position for the merged nodes.
            if (state.pathCount % 2 == 0) {
                // Even number of paths.
                var firstTop = paths.eq((state.pathCount / 2) - 1).children(".node:first").position().top,
                    secondTop = paths.eq((state.pathCount / 2)).children(".node:first").position().top;
                newTop = firstTop + ((secondTop - firstTop) / 2);
            } else {
                // Odd number of paths.
                newTop = paths.eq(Math.floor(state.pathCount / 2)).children(".node:first").position().top;
            }
            console.log("adore: top position of merged nodes: " + newTop + "px");

            // The source and target nodes are moved to the new top position and are faded out.
            paths.each(function (index) {
                var nodes = $(this).children("div.node:first,div.node:last");
                if (index == 0) {
                    jsPlumb.animate(nodes, { top: newTop + "px" }, { duration: 500, complete: repaint });
                } else {
                    jsPlumb.animate(nodes, { top: newTop + "px", opacity: 0 }, { duration: 500, complete: repaint });
                }
            });

            var allConns = jsPlumb.getAllConnections().jsPlumb_DefaultScope;

            for (var i = 0; i < allConns.length; i += 1) {
                allConns[i].setConnector("Bezier", { curviness: 300 });
            }
        }

        function expandSourceAndTargetNodes() {
            var config = adore.config,
                state = adore.state,
                paths = config.drawingArea.children();

            // We can restore the merged nodes to their original position by
            // setting their CSS property "top" to nothing.
            paths.each(function () {
                var nodes = $(this).children("div.node");
                jsPlumb.animate(nodes, { top: nodes.data("oldTop") + "px", opacity: 1 }, { duration: 500, complete: repaint });
            });
        }

        // This function positions the single nodes that form a path in suitable way.
        // All nodes are distributed on the available space evenly.
        // Expects the jQuery object that represents the path `<div>`.
        function positionNodesOnPath(pathDiv) {
            var nodeDivs = pathDiv.children(".node"),
                nodeWidth = nodeDivs.first().width(),
                nodeCount = nodeDivs.length,
                margin = (pathDiv.width() - (nodeCount * nodeWidth)) / (nodeCount - 1);


            nodeDivs.each(function (index) {
                $(this).css("margin-left", index * (nodeWidth + margin));
            })
        }

        function switchPaths(oldPathDiv, newPathDiv, onCompletion) {
            jsPlumb.animate(oldPathDiv, { opacity: 0 }, { duration: 500, complete: function () {
                oldPathDiv.hide();
                newPathDiv.show();

                positionNodesOnPath(newPathDiv);
                repaint();

                jsPlumb.animate(newPathDiv, { opacity: 1 }, { duration: 500, complete: onCompletion });
            } });
        }

        // This function draws all paths from the JSON dataset.
        // It expects the current internal state, the config and two functions.
        // `onSuccess` is executed if the drawing succeeds properly.
        // `onFailure` is executed if there is an error, e.g. validating the JSON dataset.
        function draw(onSuccess, onFailure) {
            var state = adore.state,
                config = adore.config;

            // This function is later called if the JSON schema validation succeeds.
            function continueDrawing() {
                // We iterate through all paths, create a new path `div` and append it to the drawing area.
                for (var i = 0; i < state.pathCount; i += 1) {
                    var pathDiv = makePathDiv(state.jsonData.paths[i]);

                    // We append the generated path `<div>` to the drawing area `<div>`.
                    config.drawingArea.append(pathDiv);

                    // We position the nodes on the path.
                    positionNodesOnPath(pathDiv);

                    // We hide all but the first path.
                    if (i > 0) {
                        pathDiv.hide();
                        pathDiv.css("opacity", 0);
                    }
                }

                // We draw all edges. Only the edges of the currently visible path on screen
                // will be visible.
                for (var j = 0; j < state.pathCount; j += 1) {
                    var currPath = state.jsonData.paths[j],
                        edgeCount = currPath.edges.length;

                    for (var k = 0; k < edgeCount; k += 1) {
                        drawEdge(currPath.edges[k], currPath.id);
                    }
                }

                // We are finished. We store the current path index.
                if (state.pathCount > 0) {
                    state.activePathIndex = 0;
                }

                // Drawing succeded without errors, so we call `onSuccess`.
                if ($.isFunction(onSuccess)) {
                    onSuccess();
                }
            }

            // First we validate the JSON instance against our JSON schema.
            namespace.json.validate(continueDrawing, onFailure);
        }

        function repaint() {
            namespace.config.drawingArea.children().each(function () {
                positionNodesOnPath($(this));
            });
            jsPlumb.repaintEverything();
        }

        function destroyAll() {
            jsPlumb.reset();
            adore.config.drawingArea.empty();
        }

        // Some functions are privileged (public) and get exported here.
        drawing.draw = draw;
        drawing.repaint = repaint;
        drawing.destroyAll = destroyAll;
        drawing.mergeSourceAndTargetNodes = mergeSourceAndTargetNodes;
        drawing.expandSourceAndTargetNodes = expandSourceAndTargetNodes;
        drawing.switchPaths = switchPaths;
    });
}(window.adore = window.adore || {}));