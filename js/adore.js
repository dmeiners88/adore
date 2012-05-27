// This is the ADORE "constructor" that creates a new ADORE instance and initializes it.
// Note that this is not a real constructor, but a slightly modified module pattern.
function newAdore($, drawingArea) {
    // We use strict mode to prevent bad programming habits and to fix some JavaScript
    // quirks.
    "use strict";

    // Here come all the function definitions.

    // This function draws the given edge.
    function drawEdge(edge) {

    }

    // This function creates a `<div>` for a single source or target node.
    function makeNodeDiv(node) {
        return $("<div/>")
            .addClass("node")
            .addClass(node["class"])
            .attr("id", node.id)
            .text(node.label);
    }

    // This function creates a `<div>` for a single path from the JSON dataset,
    // subsequently adding child-`<div>`'s for all source and target nodes as well.
    function makePathDiv(path) {
        var pathDiv,
            i,
            edgeCount,
            currEdge;

        pathDiv = $("<div/>")
            .addClass("path")
            .attr("id", path.id);

        for (i = 0, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from));
            pathDiv.append(makeNodeDiv(currEdge.to));
        }

        return pathDiv;
    }

    // This function takes a JSON object and draws it.
    function drawFromJson(json) {
        var i,
            pathCount;

        // For each path in the JSON, we create a new `<div>` element and append it to
        // the drawing area.
        for (i = 0, pathCount = json.paths.length; i < pathCount; i += 1) {
            drawingArea.append(makePathDiv(json.paths[i]));
        }
    }

    // This function handles the loading of a CSS skin file and applies its styles
    // to the current graph.
    function skinFileChange(evt) {

    }

    // This function handles the loading of a JSON data file and triggers its
    // parsing and drawing.
    function jsonFileChange(evt) {
        var file = evt.target.files[0],
            reader;

        if (file) {
            reader = new FileReader();

            // We assign a callback function to the `onload` event of the `FileReader`.
            // It is called when the `FileReader` object finishes its read operation.
            reader.onload = function (f) {
                // We display the file name on the label.
                $("#jsonFileName").text(evt.target.value);

                // We call the graph drawing function.
                drawFromJson($.fromJsonRef(f.target.result));
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    // Binds all HTML controls to JavaScript logic.
    function bindControls() {
        var skinFile = $("#skinFile").get(0),
            jsonFile = $("#jsonFile").get(0);

        skinFile.onchange = skinFileChange;
        jsonFile.onchange = jsonFileChange;

        $("#skinFileBrowseButton").get(0).onclick = function () { skinFile.click(); };
        $("#jsonFileBrowseButton").get(0).onclick = function () { jsonFile.click(); };
    }

    // Makes some page elements draggable.
    function setUpDraggables() {
        $("#menuBox").draggable();
    }

    // We initialize the ADORE instance.
    bindControls();
    setUpDraggables();
}

// We initialize the global ADORE instance inside the `jQuery.ready` function.
// We pass the jQuery object as well as the drawing area.
$(function () {
    "use strict";
    newAdore(jQuery, $("#drawingArea"));
});