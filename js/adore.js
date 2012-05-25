// This is the ADORE object that holds all the ADORE-specific functions
// and internal state information.
var adore = (function () {
    // Here come all the function definitions.

    // Binds all HTML controls to JavaScript logic.
    function bindControls() {

        $("#jsonFile").get(0).onchange = jsonFileChange;
        $("#skinFile").get(0).onchange = skinFileChange;

        $("#skinFileBrowseButton, #jsonFileBrowseButton").each(function (index, element) {
            element.onclick = function () {
                $("#" + element.dataset["for"]).get(0).click();
            };
        });
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
                // We display the file name on the label.
                $("#jsonFileName").text(evt.target.value);

                // We call the graph drawing function.
                drawFromJson(f.target.result);
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    // This function takes a JSON text fragment, parses it and draws it.
    function drawFromJson(jsonText) {
        var json = $.fromJsonRef(jsonText);
        var d = $("#drawingArea");

        // For each path in the JSON, we create a new `<div>` element.
        var pathCount = json.paths.length;
        var i;
        for (i = 0; i < pathCount; i += 1) {
            var currPath = json.paths[i];
            var j;
            var edgeCount = currPath.edges.length;
            var pathDiv = $("<div/>").addClass("path").attr("id", currPath.id);
            d.append(pathDiv);

            // We draw the current path in its own `<div>`.
            // We start with looping trough the edges of the current path and inserting
            // the source and target nodes.
            for (j = 0; j < edgeCount; j += 1) {
                var currEdge = currPath.edges[j];
                var sourceNodeDiv = $("<div/>").addClass("node").addClass(currEdge.from["class"])
                    .attr("id", currEdge.from.id).text(currEdge.from.label);
                var targetNodeDiv = $("<div/>").addClass("node").addClass(currEdge.to["class"])
                    .attr("id", currEdge.to.id).text(currEdge.to.label);
                pathDiv.append(sourceNodeDiv).append(targetNodeDiv);
            }
        }
    }

    // This function handles the loading of a CSS skin file and applies its styles
    // to the current graph.
    function skinFileChange(evt) {

    }

    // Makes some page elements draggable.
    function setUpDraggables() {
        $("#menuBox").draggable();
    }

    // This function initializes the ADORE application.
    function init() {
        bindControls();
        setUpDraggables();
    }

    // We return an anonymous object which holds references to the functions
    // we want to make public.
    return {
        init: init
    };

}());

// We call the ADORE init function inside the `jQuery.ready` function to make sure
// the DOM is ready.
$(function () {
    adore.init();
});