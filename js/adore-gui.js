/*jshint browser:true,devel:true,jquery:true,strict:true */

// This is `adore-gui.js`. This file integrates the logic from `adore.js`
// into your user interface (in this case `adore.html`). That way we keep logic,
// presentation and the glue in between separate.

$(function () {
    "use strict";
    // This is the ADORE configuration object that binds the ADORE backend functionality
    // to the presentation.
    var config = {
        // The area where ADORE should draw its graphs.
        drawingArea: $("#drawingArea"),
    };

    function activateStyle() {
        var fileName = $("#scenario option:selected").val();

        if (fileName == "academic-instance.json") {
            $.ajax("skins/academic/academic.css").done(function (data) {
                var styleNode = $("<style />")
                .attr("type", "text/css")
                .attr("id", "domain-specific-style")
                .text(data);
                $("head").append(styleNode);
                // A repaint is needed because the appliance of the CSS file may have changed
                // the size and position of the nodes.
                adore.repaint();
                // We also update the label indicating the CSS file name.
                    $("#skinFileName").text(fileName);
            });
        } else if (fileName == "metal-instance.json") {
             $.ajax("skins/metal/metal.css").done(function (data) {
                var styleNode = $("<style />")
                .attr("type", "text/css")
                .attr("id", "domain-specific-style")
                .text(data);
                $("head").append(styleNode);
                // A repaint is needed because the appliance of the CSS file may have changed
                // the size and position of the nodes.
                adore.repaint();
                // We also update the label indicating the CSS file name.
                $("#skinFileName").text(fileName);
            });
        } else if (fileName == "social-instance.json") {
            $.ajax("skins/social/social.css").done(function (data) {
                var styleNode = $("<style />")
                .attr("type", "text/css")
                .attr("id", "domain-specific-style")
                .text(data);
                $("head").append(styleNode);
                // A repaint is needed because the appliance of the CSS file may have changed
                // the size and position of the nodes.
                adore.repaint();
                // We also update the label indicating the CSS file name.
                $("#skinFileName").text(fileName);
            });
        }
    }

    // We handle the file upload of the JSON data set and the CSS skin file
    // in the same function.
    function handleFileUpload(evt) {
        var fileName = evt.target.value;

        adore.reset();
        $("#domain-specific-style").remove();
        $("#activateStyleButton").get(0).disabled = false;

        $.ajax("json-instances/" + fileName).done(function (data) {
            adore.setJsonData(data);
            adore.drawFromJson();
            $("#jsonFileName").text(fileName);
            $("#pathIDSpan").text((adore.getActivePathIndex() + 1).toString() + " of " + adore.getPathCount());
        });
    }

    adore.setConfig(config);

    var pathIDSpan = $("#pathIDSpan");

    // We setup a button that enables the user to switch to the previous path.

    var previousPathButton = $("#previousPathButton");
    previousPathButton.click(function () {
        previousPathButton.attr("disabled", "disabled");
        nextPathButton.attr("disabled", "disabled");
        adore.switchToPreviousPath(function () {
            previousPathButton.removeAttr("disabled");
            nextPathButton.removeAttr("disabled");
        });
        pathIDSpan.text((adore.getActivePathIndex() + 1).toString() + " of " + adore.getPathCount());
    });

    // The same to navigate to the next path.
    var nextPathButton = $("#nextPathButton");
    nextPathButton.click(function () {
        nextPathButton.attr("disabled", "disabled");
        previousPathButton.attr("disabled", "disabled");
        adore.switchToNextPath(function () {
            nextPathButton.removeAttr("disabled");
            previousPathButton.removeAttr("disabled");
        });
        pathIDSpan.text((adore.getActivePathIndex() + 1).toString() + " of " + adore.getPathCount());
    });

    // We set up a new pair of buttons to invoke the file select dialog
    // boxes. The original, ugly buttons have been hidden via CSS.
    var scenario = $("#scenario"),
        activateStyleButton = $("#activateStyleButton");

    // The ugly, hidden buttons are bound to their corresponding functions.
    scenario.get(0).onchange = handleFileUpload;
    activateStyleButton.get(0).onclick = function (e) {
        e.preventDefault();
        activateStyle();
        $(this).get(0).disabled = true;
    };
});