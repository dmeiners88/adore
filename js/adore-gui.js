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

        // A function that should be called when a CSS skin file
        // has been loaded. Supports only the file name for now.
        skinFileLoadedCallback: function (fileName) {
            $("#skinFileName").text(fileName);
        },

        // A function that should be called when a JSON data file
        // has been loaded. Supports only the file name for now.
        jsonFileLoadedCallback: function(fileName) {
            $("#jsonFileName").text(fileName);
        }
    };

    adore.setConfig(config);

    // We setup a button that enables the user to switch to the previous path.
    $("#previousPathButton").click(function () {
        $(this).get(0).disabled = true;
        adore.switchToPreviousPath();
        $(this).get(0).disabled = false;
    });

    // The same to navigate to the next path.
    $("#nextPathButton").click(function () {
        $(this).get(0).disabled = true;
        adore.switchToNextPath();
        $(this).get(0).disabled = false;
    });

    // We set up a new pair of buttons to invoke the file select dialog
    // boxes. The original, ugly buttons have been hidden via CSS.
    var skinFileInput = $("#skinFile"),
        jsonFileInput = $("#jsonFile");

    // The ugly, hidden buttons are bound to their corresponding functions.
    skinFileInput.get(0).onchange = adore.skinFileChange;
    jsonFileInput.get(0).onchange = adore.jsonFileChange;

    // The new, cool buttons fire the click event of the hidden buttons, if they themselves
    // are clicked.
    $("#skinFileBrowseButton").get(0).onclick = function () { skinFileInput.click(); };
    $("#jsonFileBrowseButton").get(0).onclick = function () { jsonFileInput.click(); };
});