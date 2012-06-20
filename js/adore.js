/*jshint browser:true,devel:true,jquery:true,strict:true */

// This is the ADORE "constructor" that creates a new ADORE instance and initializes it.
// Note that this is not a real constructor, but a slightly modified module pattern.
function newAdore($, config) {
    // We use strict mode to prevent bad programming habits and to fix some JavaScript
    // quirks.
    "use strict";

    // Here come all the function definitions.

    // This function draws the given edge.
    function drawEdge(edge) {
        console.log("adore: drawing edge from " + edge.from.id + " to " + edge.to.id);
        jsPlumb.connect({ source: edge.from.id, target: edge.to.id, anchor: "AutoDefault" },
                        { endpoint: [ "Blank" ] });
    }

    // This function creates a `<div>` for a single source or target node.
    function makeNodeDiv(node) {
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
        var nodeDivs = pathDiv.children(".node");

        nodeDivs.each(function (index) {
            $(this).css("left",
                ((100 / nodeDivs.length * (index + 1)) - 100 / nodeDivs.length / 2).toString() + "%");
        });
    }

    // This function creates a `<div>` for a single path from the JSON dataset,
    // subsequently adding child-`<div>`'s for all source and target nodes as well.
    function makePathDiv(path) {
        var pathDiv = $("<div/>")
            .addClass("path")
            .attr("id", path.id);

        for (var i = 0, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            var currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from));
        }

        pathDiv.append(makeNodeDiv(path.edges[path.edges.length - 1].to));

        // We position the nodes on the path.
        positionNodes(pathDiv);

        return pathDiv;
    }

    // This function takes a JSON object and draws the specified path.
    function drawFromJson(json, index) {

        // For the requested path from the JSON, we create a new `<div>` element and append it to
        // the drawing area.
        config.drawingArea.append(makePathDiv(json.paths[index]));

        // Edges
        for (var i = 0, edgeCount = json.paths[index].edges.length; i < edgeCount; i += 1) {
            var currEdge = json.paths[index].edges[i];
            drawEdge(currEdge);
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

                // We call the graph drawing function.
                drawFromJson($.fromJsonRef(f.target.result), 0);
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
    }

    // We initialize the ADORE instance.
    bindControls();
}