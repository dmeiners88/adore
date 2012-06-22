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
    var jsonData = {};

    // Here come all the function definitions.

    // This function draws the given edge.
    function drawEdge(edge) {
        console.log("adore: drawing edge from " + edge.from.id + " to " + edge.to.id + ".");
        jsPlumb.connect({ source: edge.from.id, target: edge.to.id, anchor: "AutoDefault" },
                        { endpoint: [ "Blank" ] });
    }

    // This function creates a `<div>` for a single source or target node.
    function makeNodeDiv(node) {
        console.log("adore: creating node " + node.id + ".");
        return $("<div/>")
            .addClass("node")
            .addClass(node["class"])
            .attr("id", node.id)
            .text(node.label);
    }

    // This function positions the single nodes that form a path in suitable way.
    // It tries to use as much space from the drawing area as possible.
    // Expects the ID of the path which holds the nodes.
    function positionNodes(pathDiv) {
        console.log("adore: positioning nodes.");
        var nodeDivs = pathDiv.children(".node");

        nodeDivs.each(function (index) {
            $(this).css("left",
                ((100 / nodeDivs.length * (index + 1)) - 100 / nodeDivs.length / 2).toString() + "%");
        });
    }

    // This function creates a `<div>` for a single path from the JSON dataset,
    // subsequently adding child-`<div>`'s for all source and target nodes as well.
    function makePathDiv(path) {
        console.log("adore: creating path with ID " + path.id + ".");
        var pathDiv = $("<div/>")
            .addClass("path")
            .attr("id", path.id);

        // We iterate through all edges and create a new `div` for each source node.
        // We avoid creating duplicate nodes this way, as the target node of edge `i`
        // is the source node of edge `i + 1`.
        for (var i = 0, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            var currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from));
        }

        // To form a complete path, we also create a `div` for the target node of the last edge.
        pathDiv.append(makeNodeDiv(path.edges[path.edges.length - 1].to));

        // We position the nodes on the path.
        positionNodes(pathDiv);

        return pathDiv;
    }

    function destroyPath(pathID) {
        var oldPath = $("#" + pathID);
        jsPlumb.detachEveryConnection();
        oldPath.remove();
    }

    // This function takes a JSON object and draws the specified path.
    function drawFromJson(index) {

        // If the requested path is not already on screen, we continue.
        if (index != activePathIndex) {
            // We first check, if there is already a path on the screen, and if remove it.
            if (activePathIndex != -1) {
                console.log("adore: requested new path with index " + index +
                    ", removing current path with ID " + jsonData.paths[activePathIndex].id + " first.");
                destroyPath(jsonData.paths[activePathIndex].id);
            }

            // Stores the index for the path displayed on screen.
            activePathIndex = index;
            console.log("adore: requested path with index " + index + " not on screen, drawing...");

            // For the requested path from the JSON, we create a new `<div>` element and append it to
            // the drawing area.
            config.drawingArea.append(makePathDiv(jsonData.paths[index]));
            console.log("adore: appending new elements to drawing area.");

            // We iterate thorugh all the edges and call the edge drawing function.
            for (var i = 0, edgeCount = jsonData.paths[index].edges.length; i < edgeCount; i += 1) {
                var currEdge = jsonData.paths[index].edges[i];
                drawEdge(currEdge);
            }

            console.log("adore: finished drawing of path with index " + index + ", ID " +
                jsonData.paths[index].id + ".");
        } else {
            // The requested path is already on screen, we skip its drawing.
            console.log("adore: requested path with index " + index + " already on screen, skipping...");
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

                // We call the graph drawing function with the index `0` to draw the first
                // path from the file.
                drawFromJson(0);

                // As we now have a single path on the screen we display the
                // path navigation controls.
                $("#pathNavigator").show();
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    // Binds all HTML controls to JavaScript logic.
    function bindControls() {
        var skinFile = config.skinFileInput.get(0),
            jsonFile = config.jsonFileInput.get(0);

        skinFile.onchange = skinFileChange;
        jsonFile.onchange = jsonFileChange;

        config.previousPathButton.click(function () {
            drawFromJson(activePathIndex - 1);
        });

        config.nextPathButton.click(function () {
            drawFromJson(activePathIndex + 1);
        });

        // All jsPlumb connections need to be redrawn if the window is resized
        $(window).resize(function () {
            jsPlumb.repaintEverything();
        });
    }

    // We initialize the ADORE instance.
    bindControls();
}