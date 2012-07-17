/*jshint browser:true,devel:true,jquery:true,strict:true */
/*global jsPlumb:true */

// ADORE is using the Revealing Module Pattern as described at
// [Learning JavaScript Design Patterns](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript)

var adore = function () {
    // We use strict mode to prevent bad programming habits and to fix some JavaScript
    // quirks.
    "use strict";

    // Private state variables

    // The config object with its default values.
    var config = {
        drawingArea: $("#drawingArea"),
    };

    // The index in the JSON data set of the active path on screen.
    var activePathIndex = -1;

    // The total number of paths in the current JSON data set.
    var pathCount = -1;

    // The current JSON data set.
    var jsonData = {};

    // We set some default settings for our jsPlumb instance.
    jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Connector: [ "Straight" ],
        Endpoints: [ "Blank", "Blank" ],
        ConnectionOverlays: [
            // BUG: Location of overlay is only partially effective. Text is displaced.
            [ "Label", { location: 0.5 } ]
        ]
    });

    // If the window gets resized, jsPlump needs to repaint all the SVG edges.
    $(window).resize(function () { jsPlumb.repaintEverything(); });

    // Here come all the function definitions.

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
                [ "Label", { label: edge["class"], cssClass: edge["class"] } ]
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
    // Expects the jQuery object that represents the path `div`.
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

    // Calculates the next path index. If the next path index would be out of bounds, returns
    // the maximum path index.
    function getNextPathIndex() {
        var nextIndex = ((activePathIndex + 1) < pathCount) ? activePathIndex + 1 : activePathIndex;

        console.log("Next path index is " + nextIndex);
        return nextIndex;
    }

    // Calculates the previous path index. Analogous to `getNextPathIndex`.
    function getPreviousPathIndex() {
        var previousIndex = ((activePathIndex - 1) >= 0) ? activePathIndex - 1 : activePathIndex;

        console.log("Previous path index is " + previousIndex);
        return previousIndex;
    }

    // Returns a path ID for a given path index.
    function getPathIdByIndex(index) {
        return jsonData.paths[index].id;
    }

    // Switches to the previous path.
    function switchToPreviousPath() {
        var currentPathID = getPathIdByIndex(activePathIndex),
            previousIndex = getPreviousPathIndex(),
            previousPathID = getPathIdByIndex(previousIndex);

        if (currentPathID != previousPathID) {
            $("#" + currentPathID).fadeOut("slow", function () {
                $("#" + previousPathID).fadeIn("slow");
                jsPlumb.repaintEverything();
            });

            activePathIndex = previousIndex;
        }
    }

    // Switches to the next path.
    function switchToNextPath() {
        var currentPathID = getPathIdByIndex(activePathIndex),
            nextIndex = getNextPathIndex(),
            nextPathID = getPathIdByIndex(nextIndex);

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

            // We append the generated path `div` to the drawing area `div`.
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

        // We are finished. We store the current path index.
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
                    .attr("id", "domain-specific-style");
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
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    // Sets a new config object for ADORE. Missing properties retain their default values.
    // Uses jQuery to merge the two objects into the first.
    function setConfig(c) {
        $.extend(config, c);
    }

    // Sets the JSON date set, ADORE should operate on.
    //
    // TODO: When a new JSON data set is given, all paths on screen should be deleted
    // and the internal state of ADORE should be reset.
    function setJsonData(json) {
        jsonData = json;
    }

    // Some functions need to be public, so we export (reveal) them.
    return {
        switchToPreviousPath: switchToPreviousPath,
        switchToNextPath: switchToNextPath,
        setConfig: setConfig,
        skinFileChange: skinFileChange,
        jsonFileChange: jsonFileChange,
        setJsonData: setJsonData
    };
}();