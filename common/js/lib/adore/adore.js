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
    });
}(window.adore = window.adore || {}));