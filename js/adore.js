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
    function connectViaId(fromID, toID, connClass) {
        jsPlumb.connect({ source: fromID,
                          target: toID,
                          anchor: "AutoDefault",
                          connector: ["Straight", { curviness: 75 }],
                          cssClass: connClass,
                          endpoint: [ "Blank" ],
                          overlays: [ [ "Label", { label: connClass, location: 0.5} ] ] });
    }

    // This function draws the given edge.
    function drawEdge(edge, pathID) {
        console.log("adore: trying to draw edge from " + pathID + "-" + edge.from.id + " to " +
            pathID + "-" + edge.to.id);

        connectViaId(pathID + "-" + edge.from.id, pathID + "-" + edge.to.id, edge["class"]);
    }

    // This function creates a `<div>` for a single source or target node.
    function makeNodeDiv(node, pathID) {
        return $("<div/>")
            .addClass("node")
            .addClass(node["class"])
            .attr("id", pathID + "-" + node.id)
            .append($("<div/>").addClass("label").text(node.label));
    }

    // This function positions the single nodes that form a path in suitable way.
    // Expects the ID of the path which holds the nodes.
    function positionNodesOnPath(pathDiv) {
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

        // We iterate through all edges and create a new `div` for each source node.
        for (var i = 0, edgeCount = path.edges.length; i < edgeCount; i += 1) {
            var currEdge = path.edges[i];
            pathDiv.append(makeNodeDiv(currEdge.from, path.id));
        }

        // For the last edge, we also create the target node.
        pathDiv.append(makeNodeDiv(path.edges[path.edges.length - 1].to, path.id));

        return pathDiv;
    }

    function getNextPathIndex() {
        var nextIndex = ((activePathIndex + 1) < pathCount) ? activePathIndex + 1 : activePathIndex;

        console.log("Next path index is " + nextIndex);
        return nextIndex;
    }

    function getPreviousPathIndex() {
        var previousIndex = ((activePathIndex - 1) >= 0) ? activePathIndex - 1 : activePathIndex;

        console.log("Previous path index is " + previousIndex);
        return previousIndex;
    }

    function switchToPreviousPath() {
        var currentPathID = jsonData.paths[activePathIndex].id,
            previousIndex = getPreviousPathIndex(),
            previousPathID = jsonData.paths[previousIndex].id;

        if (currentPathID != previousPathID) {
            $("#" + currentPathID).fadeOut("slow", function () {
                $("#" + previousPathID).fadeIn("slow");
                jsPlumb.repaintEverything();
            });

            activePathIndex = previousIndex;
        }
    }

    function switchToNextPath() {
        var currentPathID = jsonData.paths[activePathIndex].id,
            nextIndex = getNextPathIndex(),
            nextPathID = jsonData.paths[nextIndex].id;

        if (currentPathID != nextPathID) {
            $("#" + currentPathID).fadeOut("slow", function () {
                $("#" + nextPathID).fadeIn("slow");
                jsPlumb.repaintEverything();
            });

            activePathIndex = nextIndex;
        }
    }

    // This function draws all paths from the JSON dataset.
    function drawFromJson() {
        // We iterate through all paths, create a new path `div` and append it to the drawing area.
        for (var i = 0; i < pathCount; i += 1) {
            var pathDiv = makePathDiv(jsonData.paths[i]);

            // We position the nodes on the path.
            positionNodesOnPath(pathDiv);

            config.drawingArea.append(pathDiv);

            // We hide all but the first path.
            if (i > 0) {
                $(pathDiv).hide();
            }
        }

        // We draw the edges specific for each path.
        for (var j = 0; j < pathCount; j += 1) {
            var currPath = jsonData.paths[j],
                edgeCount = currPath.edges.length;

            for (var k = 0; k < edgeCount; k += 1) {
                drawEdge(currPath.edges[k], currPath.id);
            }
        }

        // We are finished, lastly we set some internal state variables
        activePathIndex = 0;
    }

    // This function handles the loading of a CSS skin file and applies its styles
    // to the current graph.
    function skinFileChange(evt) {
        var file = evt.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (f) {
                config.skinFileLoadedCallback(evt.target.value);

                console.log("adore: loaded " + evt.target.value + " skin file.");

                var node = $("<style />")
                    .text(f.target.result)
                    .attr("type", "text/css")
                    .attr("id", "domain-style");
                $("head").append(node);

                jsPlumb.repaintEverything();
            };

            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
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
            console.log($(this).get(0).id + " clicked");
            $(this).get(0).disabled = true;
            switchToPreviousPath();
            $(this).get(0).disabled = false;
            $("#pathIDSpan").text((activePathIndex + 1).toString() + " of " + pathCount);
        });

        config.nextPathButton.click(function () {
            console.log($(this).get(0).id + " clicked");
            $(this).get(0).disabled = true;
            switchToNextPath();
            $(this).get(0).disabled = false;
            $("#pathIDSpan").text((activePathIndex + 1).toString() + " of " + pathCount);
        });

        // All jsPlumb connections need to be redrawn if the window is resized
        $(window).resize(function () {
            jsPlumb.repaintEverything();
        });
    }

    // We initialize the ADORE instance.
    bindControls();
}