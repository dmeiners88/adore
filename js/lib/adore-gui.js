/*jshint browser:true,devel:true,jquery:true,strict:true */

// This is `adore-gui.js`. This file integrates the logic from `adore.js`
// into your user interface (in this case `adore.html`). That way we keep logic,
// presentation and the glue in between separate.

define(["jquery", "adore/base", "less"], function ($, adore, less) {
    "use strict";

    // This is the ADORE configuration object that binds the ADORE backend functionality
    // to the presentation.
    var config = {
        // The area where ADORE should draw its graphs.
        drawingArea: $("#drawingArea"),
    };

    // This function receives the JSON schema validation report and displays it.
    function validationCallback(report) {
        var reportBox = $("#reportBox"),
            errorList = $("<ul/>");

        if (report.errors.length > 0) {
            for (var i = 0; i < report.errors.length; i += 1) {
                var currError = report.errors[i];

                errorList.append($("<li/>").text(currError.message + " – " + currError.uri));
            }

            reportBox.append(errorList);
            reportBox.dialog( { modal: true, width: 500 } );
        }
    }

    // We handle the file upload of the JSON data set and the CSS skin file
    // in the same function.
    function handleFileUpload(evt) {
        var fileObject = evt.target.files[0],
            fileName = evt.target.value,
            // The user control that fired the event.
            sourceControl = evt.target.id;

        if (fileObject) {
            var reader = new FileReader();

            reader.onload = function (f) {
                // If a JSON file has been loaded, pass the JSON data set to ADORE,
                // draw the contents of the file and update the label indicating the file name.
                if (sourceControl == "jsonFile") {
                    adore.setJsonData(f.target.result);
                    var pathDiv = adore.drawFromJson();

                    config.drawingArea.empty();
                    config.drawingArea.append(pathDiv);
                    adore.drawEdges

                    $("#jsonFileName").text(fileName);
                    $("#pathIDSpan").text((adore.getActivePathIndex() + 1).toString() + " of " + adore.getPathCount());

                    // We show the path navigator
                    $("#pathNavigator").show();
                }

                // If a CSS skin file has been loaded, build a `<style>` tag that holds the
                // contents of the CSS file and append it to the `<head>` tag of the document.
                if (sourceControl == "skinFile") {
                    var styleNode = $("<style />")
                        .attr("type", "text/css")
                        .attr("id", "domain-specific-style")
                        .text(f.target.result);
                    $("head").append(styleNode);

                    // A repaint is needed because the appliance of the CSS file may have changed
                    // the size and position of the nodes.
                    adore.repaint();

                    // We also update the label indicating the CSS file name.
                    $("#skinFileName").text(fileName);
                }
            };

            reader.readAsText(fileObject);
        } else {
            console.error("adore: failed to load from file" + evt.target.value);
        }
    }

    function setup() {
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
        var skinFileInput = $("#skinFile"),
            jsonFileInput = $("#jsonFile");

        // The ugly, hidden buttons are bound to their corresponding functions.
        skinFileInput.get(0).onchange = handleFileUpload;
        jsonFileInput.get(0).onchange = handleFileUpload;

        // The new, cool buttons fire the click event of the hidden buttons, if they themselves
        // are clicked.
        $("#skinFileBrowseButton").get(0).onclick = function () { skinFileInput.click(); };
        $("#jsonFileBrowseButton").get(0).onclick = function () { jsonFileInput.click(); };
    }

    return {
        setup: setup
    };
});