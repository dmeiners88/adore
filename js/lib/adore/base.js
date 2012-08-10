// adore/base.js holds the internal state variables as well as methods
// to manipulate the internal state.

define(["jquery", "adore/drawing", "adore/json"], function ($, adoreDrawing, adoreJson) {
    "use strict";

    var state = {
        // The index in the JSON data set of the active path on screen.
        activePathIndex: -1,

        // The total number of paths in the current JSON data set.
        pathCount: -1,

        // The current JSON data set.
        jsonData: {},

        // The JSON schema
        jsonSchema: {}
    };

    // Calculates the next path index. If the next path index would be out of bounds, returns
    // the maximum path index.
    function getNextPathIndex() {
        var nextIndex =
            ((state.activePathIndex + 1) < state.pathCount)
            ? state.activePathIndex + 1 : activePathIndex;

        console.log("Next path index is " + nextIndex);
        return nextIndex;
    }

    // Calculates the previous path index. Analogous to `getNextPathIndex`.
    function getPreviousPathIndex() {
        var previousIndex =
            ((state.activePathIndex - 1) >= 0)
            ? state.activePathIndex - 1 : state.activePathIndex;

        console.log("Previous path index is " + previousIndex);
        return previousIndex;
    }

    // Returns a path ID for a given path index.
    function getPathIdByIndex(index) {
        return state.jsonData.paths[index].id;
    }

    // Switches to the previous path. Expects a callback function that is executed
    // when the path fade-out and fade-in animations have finished.
    function switchToPreviousPath(callback) {
        var currentPathID,
            previousIndex,
            previousPathID;

        if (state.activePathIndex > -1) {
            currentPathID = getPathIdByIndex(state.activePathIndex);
            previousIndex = getPreviousPathIndex();
            previousPathID = getPathIdByIndex(previousIndex);

            if (currentPathID != previousPathID) {
                $("#" + currentPathID).fadeOut("slow", function () {
                    $("#" + previousPathID).fadeIn("slow", callback);
                    adoreDrawing.repaint();
                });

                state.activePathIndex = previousIndex;
            } else {
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        }
    }

    // Switches to the next path. Analogous to `switchToPreviousPath`
    function switchToNextPath(callback) {
        var currentPathID,
            nextIndex,
            nextPathID;

        if (state.activePathIndex > -1) {
            currentPathID = getPathIdByIndex(state.activePathIndex);
            nextIndex = getNextPathIndex();
            nextPathID = getPathIdByIndex(nextIndex);

            if (currentPathID != nextPathID) {
                $("#" + currentPathID).fadeOut("slow", function () {
                    $("#" + nextPathID).fadeIn("slow", callback);
                    adoreDrawing.repaint();
                });

                state.activePathIndex = nextIndex;
            } else {
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        }
    }

    // Resets the internal ADORE state and destroys any drawings on screen.
    function reset() {
        state.activePathIndex = -1;
        state.pathCount = -1;
        state.jsonData = {};
        state.jsonSchema = {};
    }

    function getActivePathIndex() {
        return state.activePathIndex;
    }

    function getPathCount() {
        return state.pathCount;
    }

    // Sets the JSON data set ADORE should operate on.
    function setJsonData(json) {
        reset();

        state.jsonData = adoreJson.parseJson(json);

        if (!state.jsonData.hasOwnProperty("paths")) {
            state.pathCount = 0;
        } else {
            state.pathCount = state.jsonData.paths.length;
        }
    }

    function drawFromJson() {
        return adoreDrawing.drawFromJson();
    }

    function drawEdges() {
        adoreDrawing.drawEdges()
    }

    function repaint() {
        adoreDrawing.repaint();
    }

    function getState() {
        return state;
    }

    function setState(s) {
        $.extend(state, s);
    }

    return {
        switchToPreviousPath: switchToPreviousPath,
        switchToNextPath: switchToNextPath,
        getActivePathIndex: getActivePathIndex,
        getPathCount: getPathCount,
        reset: reset,
        setJsonData: setJsonData,
        drawFromJson: drawFromJson,
        repaint: repaint,
        getState: getState,
        setState: setState
    }
});