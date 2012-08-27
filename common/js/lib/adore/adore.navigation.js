;(function (namespace, undefined) {
    "use strict";

    // We extend the adore namespace with adore.drawing.
    namespace.navigation = namespace.navigation || {};

    // We store a local reference to save lookup times.
    var navigation = namespace.navigation,
        drawing = namespace.drawing;

    $(function () {

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

        // Switches to multi path view. Does not change the internal state variable `activePathIndex`, so
        // we can easily switch back to single path view if we need to.
        function switchToMultiPathView() {
            var config = adore.config,
                pathDivs = config.drawingArea.children();
            // As the drawing area `div` has only path `div`s as direct descendants, we simply need
            // to display the immediate children.

            pathDivs.each(function () {
                $(this).css("display", "block");
            });

            drawing.repaint();

            jsPlumb.animate(pathDivs, { opacity: 1 }, { duration: 500 });
        }

        // Switches back to single path view.
        function switchToSinglePathView() {
            var config = adore.config,
                state = adore.state;

            // We expand the previously merged nodes...
            adore.drawing.expandSourceAndTargetNodes();

            // ...and hide all inactive paths.
            config.drawingArea.children().filter(function (index) {
                return (index != state.activePathIndex);
            }).hide();

            adore.drawing.repaint();
        }

        navigation.navigatePaths = navigatePaths;
        navigation.switchToSinglePathView = switchToSinglePathView;
        navigation.switchToMultiPathView = switchToMultiPathView;
    });
}(window.adore = window.adore || {}));