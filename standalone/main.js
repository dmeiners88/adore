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
        standalone: "../../../standalone"
    },

    // Non-AMD-compliant JavaScript dependencies are configured here. Do not touch.
    shim: {
        "json.ref": ["jquery"],
        "jquery-ui": ["jquery"],
        "jsPlumb": {
            deps: ["jquery", "jquery-ui"],
            exports: "jsPlumb"
        }
    }
});

// This requires your client-specific JavaScript module. Bootstrapping code
// is therefore in standalone.js.
require(["standalone/standalone"], function (standalone) {
    standalone.init();
});