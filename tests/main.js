requirejs.config({
    // This should point to the directory where all JavaScript dependencies are stored.
    // This path is relative to the HTML file that imports require.js
    // adore.js
    // jquery.js
    // jquery-ui.js
    // jsPlumb.js
    // json.ref.js
    // less.js
    // schema.js
    baseUrl: "../common/js/lib",

    // For your client-specific JavaScript code, adjust this path. This path is
    // relative to baseUrl (above).
    paths: {
        qunit: "../../../tests/qunit"
    },

    // Non-AMD-compliant JavaScript dependencies are configured here. Do not touch.
    shim: {
        "json.ref": ["jquery"],
        "jquery-ui": ["jquery"],
        "jsPlumb": {
            deps: ["jquery", "jquery-ui"],
            exports: "jsPlumb"
        },
        "adore/adore": {
            deps: ["jquery", "adore/adore.drawing", "adore/adore.json", "adore/adore.navigation"],
            exports: "adore"
        },
        "adore/adore.drawing": ["jsPlumb"],
        "adore/adore.navigation": ["jquery"],
        "adore/adore.json": ["jquery", "json.ref", "adore/adore.json.schema"],
        "qunit/tests": ["adore/adore"]
    }
});

requirejs(["qunit/qunit", "qunit/tests"], function () { });