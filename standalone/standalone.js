/*jshint browser:true,devel:true,jquery:true,strict:true */

// This is `standalone.js`. This file integrates the logic from `adore`
// into your user interface (in this case `standalone.html`). That way we keep logic,
// presentation and the glue in between separate.

// We wait for jQuery being ready.
$(function () {
    "use strict";
    // This is the ADORE configuration object that binds the ADORE backend functionality
    // to the presentation.
    var config = {
        // The area where ADORE should draw its graphs.
        drawingArea: $("#drawingArea"),
    };

    // This function receives the JSON schema validation report and displays it.
    function displayReport(error) {
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
            sourceControl = evt.target.id,
            state = adore.state;

        if (fileObject) {
            var reader = new FileReader();

            reader.onload = function (f) {
                // If a JSON file has been loaded, pass the JSON data set to ADORE,
                // draw the contents of the file and update the label indicating the file name.
                if (sourceControl == "jsonFile") {
                    $("#domain-specific-style").remove();

                    adore.json.set(f.target.result);
                    $("#jsonInstanceText").text(f.target.result);

                    adore.drawing.draw(undefined, displayReport);
                    $("#jsonFileName").text(fileName);
                    $("#pathIDSpan").text((state.activePathIndex + 1).toString() + " of " + state.pathCount);

                    // We show the path navigator
                    $("#pathNavigator").show();
                }

                // If a CSS skin file has been loaded, build a `<style>` tag that holds the
                // contents of the CSS file and append it to the `<head>` tag of the document.
                if (sourceControl == "skinFile") {
                    $("#domain-specific-style").remove();

                    var styleNode = $("<style />")
                        .attr("type", "text/less")
                        .attr("id", "domain-specific-style")
                        .text(f.target.result);
                    $("head").append(styleNode);

                    $("#lessText").text(f.target.result);

                    less.refresh();

                    // A repaint is needed because the appliance of the CSS file may have changed
                    // the size and position of the nodes.
                    adore.drawing.repaint();

                    // We also update the label indicating the CSS file name.
                    $("#skinFileName").text(fileName);
                }
            };

            reader.readAsText(fileObject);
        } else {
            console.error("adore: failed to load from file " + evt.target.value + ".");
        }
    }

    function draw() {
        adore.reset();
        var state = adore.state;

        $("#domain-specific-style").remove();

        adore.json.set($("#jsonInstanceText").val());
        adore.drawing.draw(undefined, displayReport);
        $("#pathIDSpan").text((state.activePathIndex + 1).toString() + " of " + state.pathCount);

        // We show the path navigator
        $("#pathNavigator").show();

        var styleNode = $("<style />")
            .attr("type", "text/less")
            .attr("id", "domain-specific-style")
            .text($("#lessText").val());
        $("head").append(styleNode);

        less.refresh();

        // A repaint is needed because the appliance of the CSS file may have changed
        // the size and position of the nodes.
        adore.drawing.repaint();
    }

    function init() {
        $.extend(adore.config, config);

        var pathIDSpan = $("#pathIDSpan"),
            state = adore.state,
            navigation = adore.navigation;

        // We setup a button that enables the user to switch to the previous path.
        var previousPathButton = $("#previousPathButton");
        previousPathButton.click(function () {
            previousPathButton.attr("disabled", "disabled");
            nextPathButton.attr("disabled", "disabled");
            adore.navigation.navigatePaths(-1, function () {
                previousPathButton.removeAttr("disabled");
                nextPathButton.removeAttr("disabled");
            });
            pathIDSpan.text((state.activePathIndex + 1).toString() + " of " + state.pathCount);
        });

        // The same to navigate to the next path.
        var nextPathButton = $("#nextPathButton");
        nextPathButton.click(function () {
            nextPathButton.attr("disabled", "disabled");
            previousPathButton.attr("disabled", "disabled");
            adore.navigation.navigatePaths(1, function () {
                nextPathButton.removeAttr("disabled");
                previousPathButton.removeAttr("disabled");
            });
            pathIDSpan.text((state.activePathIndex + 1).toString() + " of " + state.pathCount);
        });

        // We setup the "All Paths" checkbox.
        var allPathsToggle = $("#allPathsToggle");
        allPathsToggle.change(function () {
            if ($(this).is(":checked")) {
                nextPathButton.attr("disabled", "disabled");
                previousPathButton.attr("disabled", "disabled");
                $("#pathIDSpan").hide();
                navigation.switchToMultiPathView();
            } else {
                nextPathButton.removeAttr("disabled");
                previousPathButton.removeAttr("disabled");
                $("#pathIDSpan").show();
                navigation.switchToSinglePathView();

                pathIDSpan.text((state.activePathIndex + 1).toString() + " of " + state.pathCount);
            }
        });

        // We setup the draw button.
        $("#drawButton").click(function () {
            nextPathButton.removeAttr("disabled");
            previousPathButton.removeAttr("disabled");
            $("#pathIDSpan").show();
            navigation.switchToSinglePathView();

            pathIDSpan.text((state.activePathIndex + 1).toString() + " of " + state.pathCount);

            draw();
        });

        // Reload JSON Button
        $("#reloadJSONButton").click(function () {
            var oldIndex = state.activePathIndex;

            adore.reset();

            draw();

            navigation.navigatePaths(oldIndex);

            pathIDSpan.text((state.activePathIndex + 1).toString() + " of " + state.pathCount)
        });

        // Reload CSS Button
        $("#reloadCSSButton").click(function () {
            $("#domain-specific-style").remove();

            var styleNode = $("<style />")
                .attr("type", "text/less")
                .attr("id", "domain-specific-style")
                .text($("#lessText").val());
    
            $("head").append(styleNode);
    
            less.refresh();
    
            // A repaint is needed because the appliance of the CSS file may have changed
            // the size and position of the nodes.
            adore.drawing.repaint();

        });

        // Load academic button
        $("#loadAcademic").click(function () {
            $.get("../json-instances/academic-instance2.json", function(data) {
                $("#jsonInstanceText").text(data);
            }, "text");

            $.get("../common/skins/academic/academic.less", function(data) {
                $("#lessText").text(data);
            }, "text");            
        });

        // Load social button
        $("#loadSocial").click(function () {
            $.get("../json-instances/social-instance.json", function(data) {
                $("#jsonInstanceText").text(data);
            }, "text");

            $.get("../common/skins/social/social.less", function(data) {
                $("#lessText").text(data);
            }, "text");            
        });

        // Load music button
        $("#loadMusic").click(function () {
            $.get("../json-instances/metal-instance.json", function(data) {
                $("#jsonInstanceText").text(data);
            }, "text");

            $.get("../common/skins/metal/metal.css", function(data) {
                $("#lessText").text(data);
            }, "text");            
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

    init();
});