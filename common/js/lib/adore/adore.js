/*jshint browser:true,devel:true,jquery:true,strict:true */
/*global jsPlumb:true */

// ADORE is using the Revealing Module Pattern as described at
// [Learning JavaScript Design Patterns](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript)

;(function (namespace, undefined) {
    "use strict";

    // We wait for jQuery being ready.
    $(function () {
        var drawing = namespace.drawing;

        // The config object with its default values.
        var config = {
            drawingArea: $("#drawingArea"),
        };

        // An object to group some internal state variables.
        var state = {

            // The index in the JSON data set of the active path on screen.
            activePathIndex: -1,

            // The total number of paths in the current JSON data set.
            pathCount: -1,

            // The current JSON data set.
            jsonData: {}
        };

        // Calculates the next path index. If the next path index would be out of bounds, returns
        // the maximum path index.
        function getNextPathIndex() {
            var nextIndex = ((state.activePathIndex + 1) < state.pathCount)
                ? state.activePathIndex + 1 : state.activePathIndex;

            console.log("adore: next path index is " + nextIndex + ".");
            return nextIndex;
        }

        // Calculates the previous path index. Analogous to `getNextPathIndex`.
        function getPreviousPathIndex() {
            var previousIndex = ((state.activePathIndex - 1) >= 0)
                ? state.activePathIndex - 1 : state.activePathIndex;

            console.log("adore: previous path index is " + previousIndex + ".");
            return previousIndex;
        }

        // Returns a path ID for a given path index.
        function getPathIdByIndex(index) {
            return state.jsonData.paths[index].id;
        }

        // Resets the internal ADORE state and destroys any drawings on screen.
        function reset() {
            state.activePathIndex = -1;
            state.pathCount = -1;
            state.jsonData = {};
            drawing.destroyAll();
        }

        // Some functions need to be public, so we export (reveal) them.
        namespace.reset = reset;
        namespace.state = state;
        namespace.config = config;
        namespace.getPathIdByIndex = getPathIdByIndex;
        namespace.getPreviousPathIndex = getPreviousPathIndex;
        namespace.getNextPathIndex = getNextPathIndex;
    });
}(window.adore = window.adore || {}));