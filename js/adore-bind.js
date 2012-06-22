/*jshint browser:true,devel:true,jquery:true,strict:true */

// This is `adore-bind.js`. This file integrates the logic from `adore.js`
// into your user interface (in this case `adore.html`). That way we keep logic,
// presentation and the glue in between separate.

$(function () {
    "use strict";
    // This is the ADORE configuration object that binds the ADORE backend functionality
    // to the presentation.
    var config = {
        // The area where ADORE should draw its graphs.
        drawingArea: $("#drawingArea"),

        // The file input for reading the CSS skin file.
        skinFileInput: $("#skinFile"),

        // The file input for reading the JSON data file.
        jsonFileInput: $("#jsonFile"),

        // The button that fires the previous path event.
        previousPathButton: $("#previousPathButton"),

        // The button that fires the next path event.
        nextPathButton: $("#nextPathButton"),

        // A function that should be called when a CSS skin file
        // has been loaded. Supports only the file name for now.
        skinFileLoadedCallback: function (fileName) {

        },

        // A function that should be called when a JSON data file
        // has been loaded. Supports only the file name for now.
        jsonFileLoadedCallback: function(fileName) {
            $("#jsonFileName").text(fileName);
        }
    };

    // This is user-interface specific initialization – here for example
    // we set up a new pair of buttons to invoke the file select dialog
    // boxes. The original, ugly buttons have been hidden via CSS.
    $("#skinFileBrowseButton").get(0).onclick = function () { config.skinFileInput.click(); };
    $("#jsonFileBrowseButton").get(0).onclick = function () { config.jsonFileInput.click(); };

    // Finally, we call `newAdore` to initialize the application logic.
    newAdore(jQuery, config);
});