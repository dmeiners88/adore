;(function (namespace, undefined) {
    "use strict";

    // We extend the adore namespace with adore.drawing.
    namespace.navigation = namespace.navigation || {};

    // We store a local reference to save lookup times.
    var navigation = namespace.navigation;

    $(function () {

        // Switches to the previous path. Expects a callback function that is executed
        // when the path fade-out and fade-in animations have finished.
        function switchToPreviousPath(onCompletion) {
            var currentPathID,
                previousIndex,
                previousPathID,
                state = adore.state;

            if (state.activePathIndex > -1) {
                currentPathID = adore.getPathIdByIndex(state.activePathIndex);
                previousIndex = adore.getPreviousPathIndex();
                previousPathID = adore.getPathIdByIndex(previousIndex);

                if (currentPathID != previousPathID) {
                    $("#" + currentPathID).fadeOut("150", function () {
                        $("#" + previousPathID).fadeIn("150", onCompletion);
                        adore.drawing.repaint();
                    });

                    state.activePathIndex = previousIndex;
                } else {
                    if ($.isFunction(onCompletion)) {
                        onCompletion();
                    }
                }
            }
        }

        // Switches to the next path. Analogous to `switchToPreviousPath`
        function switchToNextPath(onCompletion) {
            var currentPathID,
                nextIndex,
                nextPathID,
                state = adore.state;

            if (state.activePathIndex > -1) {
                currentPathID = adore.getPathIdByIndex(state.activePathIndex);
                nextIndex = adore.getNextPathIndex();
                nextPathID = adore.getPathIdByIndex(nextIndex);

                if (currentPathID != nextPathID) {
                    $("#" + currentPathID).fadeOut("150", function () {
                        $("#" + nextPathID).fadeIn("150", onCompletion);
                        adore.drawing.repaint();
                    });

                    state.activePathIndex = nextIndex;
                } else {
                    if ($.isFunction(onCompletion)) {
                        onCompletion();
                    }
                }
            }
        }

        // Switches to multi path view. Does not change the internal state variable `activePathIndex`, so
        // we can easily switch back to single path view if we need to.
        function switchToMultiPathView() {
            var config = adore.config;
            // As the drawing area `div` has only path `div`s as direct descendants, we simply need
            // to display the immediate children.

            config.drawingArea.children().fadeIn("150");
            //adore.drawing.mergeSourceAndTargetNodes();
            adore.drawing.repaint();
        }

        // Switches back to single path view.
        function switchToSinglePathView() {
            var config = adore.config,
                state = adore.state;

            adore.drawing.expandSourceAndTargetNodes();
            config.drawingArea.children().filter(function (index) {
                    return (index != state.activePathIndex);
            }).hide();

            adore.drawing.repaint();
        }

        navigation.switchToNextPath = switchToNextPath;
        navigation.switchToPreviousPath = switchToPreviousPath;
        navigation.switchToSinglePathView = switchToSinglePathView;
        navigation.switchToMultiPathView = switchToMultiPathView;
    });
}(window.adore = window.adore || {}));