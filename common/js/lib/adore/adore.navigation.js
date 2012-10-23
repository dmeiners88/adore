/**
    @name adore.navigation
    @namespace
*/

;(function (namespace, undefined) {
    "use strict";

    // We extend the adore namespace with adore.drawing.
    namespace.navigation = namespace.navigation || {};

    // We store a local reference to save lookup times.
    var navigation = namespace.navigation,
        drawing = namespace.drawing;

    $(function () {

        /**
            Navigates the on-screen display to another path.

            @name adore.navigation.navigatePaths
            @function
            @public
            @param {number} offset - The offset of the current path from the desired path. E.g., an offset of 1 means the
                                     next path, an offset of -1 means the previous path.
            @param {function} onCompletion - Function to execute on completion of the path switching animation.
            @example
            navigatePaths(1);  // Next path.
            navigatePaths(-1); // Previous path.
            navigatePaths(2);  // The next but one path.
        */
        function navigatePaths(offset, onCompletion) {
            var oldPathID,
                newIndex,
                newPathID,
                state = adore.state,
                oldPath,
                newPath;

            newIndex = state.activePathIndex + offset;

            if (newIndex >= state.pathCount) {
                newIndex = state.pathCount - 1;
            } else if (newIndex < 0) {
                newIndex = 0;
            }

            if (state.activePathIndex > -1 && state.activePathIndex != newIndex) {
                oldPathID = adore.getPathIdByIndex(state.activePathIndex);
                newPathID = adore.getPathIdByIndex(newIndex);
                oldPath = $("#" + oldPathID);
                newPath = $("#" + newPathID);

                drawing.switchPaths(oldPath, newPath, onCompletion);
                state.activePathIndex = newIndex;

            } else if ($.isFunction(onCompletion)) {
                onCompletion();
            }
        }

        /**
            Switches to multi path view. Does not change the internal state variable <code>activePathIndex</code>, so
            we can easily switch back to single path view if we need to.

            @name adore.navigation.switchToMultiPathView
            @function
            @public
        */
        function switchToMultiPathView() {
            var config = adore.config,
                pathDivs = config.drawingArea.children();
            // As the drawing area `div` has only path `div`s as direct descendants, we simply need
            // to display the immediate children.

            pathDivs.each(function () {
                $(this).css("display", "block");
            });

            drawing.repaint();

            $.when(jsPlumb.animate(pathDivs, { opacity: 1 }, { duration: 500 })).done(drawing.mergeSourceAndTargetNodes());
        }

        /**
            Switches back to single path view.

            @name adore.navigation.switchToSinglePathView
            @function
            @public
        */
        function switchToSinglePathView() {
            var state = adore.state;

            adore.drawing.destroyAll();
            adore.drawing.draw();

            if (state.activePathIndex != -1) {
                state.activePathIndex = 0;
            }
        }

        navigation.navigatePaths = navigatePaths;
        navigation.switchToSinglePathView = switchToSinglePathView;
        navigation.switchToMultiPathView = switchToMultiPathView;
    });
}(window.adore = window.adore || {}));