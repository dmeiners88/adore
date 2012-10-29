// ==UserScript==
// @name        TheMovieDB.org actor relations
// @namespace   http://github.com/danmei/adore
// @description This script displays relations between actors at themoviedb.org
// @include     http://www.themoviedb.org/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js
// @require     http://localhost:8080/common/js/lib/jquery.json.js
// @require     http://localhost:8080/common/js/lib/jstorage.js
// @require     http://jsplumb.org/js/jquery.jsPlumb-1.3.13-all-min.js
// @require     http://localhost:8080/common/js/lib/adore/adore.js
// @require     http://localhost:8080/common/js/lib/adore/adore.drawing.js
// @require     http://localhost:8080/common/js/lib/adore/adore.json.js
// @require     http://localhost:8080/common/js/lib/adore/adore.navigation.js
// @require     http://localhost:8080/common/js/lib/adore/adore.json.adapters.themoviedb.org.js
// @require     http://lesscss.googlecode.com/files/less-1.3.0.min.js
// @resource    bare-css http://localhost:8080/common/skins/bare/bare.css
// @version     0.1
// @updateURL   http://localhost:8080/userscript/themoviedb.org.meta.js
// ==/UserScript==

var api_key    = "c69cd982c351c47ccd809268cc49fda2",
    actor_page = /^\/person\/(\d+)-.*/,
    json = window.adore.json,
    themoviedb = json.adapters.themoviedb.org,
    drawing = window.adore.drawing;


function myLog(msg) {
    console.log("themoviedb.org userscript: " + msg);
}

function fire(firstId, secondId) {
    var dfd = $.Deferred();

    themoviedb.setApiKey(api_key);

    myLog("firing, api key is " + api_key);

    themoviedb.getCommonMovies(firstId, secondId).done(function (dataset) {
        myLog("got common movies dataset");

        json.setObject(dataset);
        drawing.draw(function () {
            dfd.resolve();
        });
    });

    return dfd.promise();
}

function run() {
    // We check if the current page is an actors page.
    var result = actor_page.exec(document.location.pathname);
    if (result) {
        var currentId = result[1],
            previousId = GM_getValue("previousId");

        myLog("caught actor page");
    
        if (currentId !== previousId) {
            GM_setValue("previousId", currentId);
        }

        $("#mainCol").prepend($("<div />").attr("id", "drawingArea"));
        var drawingArea = $("#drawingArea");

        $.extend(window.adore.config, {
            drawingArea: drawingArea
        });

        GM_addStyle(GM_getResourceText("bare-css"));
        drawingArea.css("margin-bottom", "2em");
    
        myLog("firing with ids " + currentId + " and " + previousId);
    
        $.when(fire(currentId, previousId)).then(function () {
            var prevButton = $("<button />").click(function () {
                window.adore.navigation.navigatePaths(-1, function () {
                    window.adore.drawing.repaint();
                });
            }).text("<");
            var nextButton = $("<button />").click(function () {
                window.adore.navigation.navigatePaths(1, function () {
                    window.adore.drawing.repaint();
                });
                window.adore.drawing.repaint();
            }).text(">");

            drawingArea.prepend(nextButton);
            drawingArea.prepend(prevButton);
        });
    }
}

$(function () {
    run();
});