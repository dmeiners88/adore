/**
    @name adore
    @namespace
*/
;(function (namespace, undefined) {
    "use strict";

    // We wait for jQuery being ready.
    $(function () {
        var drawing = namespace.drawing;

        /**
            The config object with its default values.
            @name adore.config
            @property {object} drawingArea - The jQuery object wrapping the drawing area.
        */
        var config = {
            drawingArea: $("#drawingArea"),
        };

        /**
             An object to group some internal state variables.
             @name adore.state
             @property {number} activePathIndex - The index in the JSON data set of the active path on screen.
             @property {number} pathCount       - The total number of paths in the current JSON data set.
             @property {object} jsonData        - The current JSON data set.
        */
        var state = {
            activePathIndex: -1,
            pathCount: -1,
            jsonData: {}
        };

        /**
            Returns a path ID for a given path index.
            @name adore.getPathIdByIndex
            @function
            @param {number} index - A path index.
            @return {number} The path ID of the path from the currently loaded dataset at the given index.
        */
        function getPathIdByIndex(index) {
            return state.jsonData.paths[index].id;
        }

        /**
            Resets the internal ADORE state and destroys any drawings on screen.
            @name adore.reset
            @function
        */
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