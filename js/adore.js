/*jshint browser:true,devel:true,jquery:true,strict:true */
/*global jsPlumb:true */

// This is the ADORE "constructor" that creates a new ADORE instance and initializes it.
// Note that this is not a real constructor, but a slightly modified module pattern.
function newAdore($, config) {
    // We use strict mode to prevent bad programming habits and to fix some JavaScript
    // quirks.
    "use strict";

    // Private state variables
    var activePathIndex = -1;
    var pathCount = -1;
    var jsonData = {};

    // Here come all the function definitions.

    // This function connects tow elements on the screen based on their IDs
    function connectViaId(fromID, toID) {
        jsPlumb.connect({ source: fromID,
                          target: toID,
                          anchor: "AutoDefault"}, { endpoint: [ "Blank" ] });
    }

    // This function draws the given edge.
    function drawEdge(edge, pathID) {
        console.log("adore: trying to draw edge from " + pathID + "-" + edge.from.id + " to " +
            pathID + "-" + edge.to.id);

        connectViaId(pathID + "-" + edge.from.id, pathID + "-" + edge.to.id);
    }

    // This function creates a `<div>` for a single source or target node.
    function makeNodeDiv(node, pathID) {
        return $("<div/>")
            .addClass("node")
            .addClass(node["class"])
            .attr("id", pathID + "-" + node.id)
            .text(node.label);
    }

    // This function positions the single nodes that form a path in suitable way.
    // It tries to use as much space from the drawing area as possible, reserving space
    // on each path fore the common source and target nodes.
    // Expects the ID of the path which holds the nodes.
    function positionNodesOnPath(pathDiv) {
        var nodeDivs = pathDiv.children(".node");

        nodeDivs.each(function (index) {
            $(this).css("left",
                ((100 / nodeDivs.length * (index + 1)) - 100 / nodeDivs.length / 2).toString() + "%");
        });
    }

    // This function positions the common source node.
    function positionSourceNode(nodeDiv) {
        if (pathCount % 2 == 1) {
            // good, we have an odd number of paths, we can simply prepend the node
            // to the "middle" path `div`.
            var pathDiv = $("#" + jsonData.paths[Math.ceil(pathCount / 2) - 1].id);

            pathDiv.prepend(nodeDiv);
            positionNodesOnPath(pathDiv);
        }
    }

    // This function positions the common target node.
    function positionTargetNode(nodeDiv) {
        if (pathCount % 2 == 1) {
            // good, we have an odd number of paths, we can simply prepend the node
            // to the "middle" path `div`.
            var pathDiv = $("#" + jsonData.paths[Math.ceil(pathCount / 2) - 1].id);

            pathDiv.append(nodeDiv);
            positionNodesOnPath(pathDiv);
        }
    }

    // This function creates a `<div>` for a single path from the JSON dataset,
    // subsequently adding child-`<div>`'s for all source and target nodes as well.
    function makePathDiv(path) {
        var pathDiv = $("<div/>")
            .addClass("path")
            .attr("id", path.id);

        // We iterate through all edges and create a new `div` for each.
        // We skip the first source node, as we want to draw the source and target nodes,
        // which are the same for each path, seperately.
        for (var i = 1, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            var currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from, path.id));
        }

        return pathDiv;
    }

    function getNextPathIndex() {
        var nextIndex = ((activePathIndex + 1) <= pathCount) ? activePathIndex + 1 : pathCount;
        activePathIndex = nextIndex;

        return nextIndex;
    }

    function getPreviousPathIndex() {
        var previousIndex = ((activePathIndex - 1) >= 0) ? activePathIndex - 1 : 0;
        activePathIndex = previousIndex;

        return previousIndex;
    }

    // This function destroys a path, identified by a given path ID.
    function destroyPath(pathID) {
        var oldPath = $("#" + pathID);
        jsPlumb.detachEveryConnection();
        oldPath.remove();
    }

    // This function draws all paths from the JSON dataset.
    function drawFromJson() {
        // We iterate through all paths, create a new path `div` and append it to the drawing area.
        for (var i = 0; i < pathCount; i += 1) {
            var pathDiv = makePathDiv(jsonData.paths[i]);

            // We position the nodes on the path.
            positionNodesOnPath(pathDiv);

            config.drawingArea.append(pathDiv);
        }

        // We still need to add the soure and target node, which are the same for each path.
        // We assume that all paths in the JSON dataset are well-formed and the source and target nodes
        // are identical on each path.
        var sourceNodeDiv = makeNodeDiv(jsonData.paths[0].edges[0].from, "source");
        var targetNodeDiv = makeNodeDiv(jsonData.paths[0].edges[jsonData.paths[0].edges.length - 1].to,
            "target");

        positionSourceNode(sourceNodeDiv);
        positionTargetNode(targetNodeDiv);

        // We draw the edges specific for each path.
        for (var j = 0; j < pathCount; j += 1) {
            var edgeCount = jsonData.paths[j].edges.length;

            // Common source and target node.
            connectViaId("source-" + jsonData.paths[j].edges[0].from.id,
                jsonData.paths[j].id + "-" + jsonData.paths[j].edges[0].to.id);

            connectViaId(jsonData.paths[j].id + "-" + jsonData.paths[j].edges[edgeCount - 1].from.id,
                "target-" + jsonData.paths[j].edges[edgeCount - 1].to.id);

            for (var k = 1; k < edgeCount - 1; k += 1) {
                drawEdge(jsonData.paths[j].edges[k], jsonData.paths[j].id);
            }
        }
    }

    // This function handles the loading of a CSS skin file and applies its styles
    // to the current graph.
    function skinFileChange(evt) {

    }

    // This function handles the loading of a JSON data file and triggers its
    // parsing and drawing.
    function jsonFileChange(evt) {
        var file = evt.target.files[0];

        if (file) {
            var reader = new FileReader();

            // We assign a callback function to the `onload` event of the `FileReader`.
            // It is called when the `FileReader` object finishes its read operation.
            reader.onload = function (f) {
                // We call the jsonFileSelectedCallback function.
                config.jsonFileLoadedCallback(evt.target.value);

                // We save the file contents for immediate and future use.
                jsonData = $.fromJsonRef(f.target.result);

                // We update some private state variables
                pathCount = jsonData.paths.length;

                console.log("adore: loaded " + evt.target.value + ", containing " + pathCount + " paths.");

                // We call the graph drawing function.
                drawFromJson();

                // As we now have a single path on the screen we display the
                // path navigation controls.
                config.pathNavigator.show();
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    // Using the properties of the given config variable, we bind the program logic to
    // the DOM elements.
    function bindControls() {
        var skinFile = config.skinFileInput.get(0),
            jsonFile = config.jsonFileInput.get(0);

        skinFile.onchange = skinFileChange;
        jsonFile.onchange = jsonFileChange;

        config.previousPathButton.click(function () {
            drawFromJson(getPreviousPathIndex());
        });

        config.nextPathButton.click(function () {
            drawFromJson(getNextPathIndex());
        });

        // All jsPlumb connections need to be redrawn if the window is resized
        $(window).resize(function () {
            jsPlumb.repaintEverything();
        });
    }

    // We initialize the ADORE instance.
    bindControls();
}