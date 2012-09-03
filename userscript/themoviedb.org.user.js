// ==UserScript==
// @name        TheMovieDB.org actor relations
// @namespace   http://github.com/danmei/adore
// @description This script displays relations between actors at themoviedb.org
// @include     http://www.themoviedb.org/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js
// @require     http://jsplumb.org/js/jquery.jsPlumb-1.3.13-all-min.js
// @require     http://localhost:8080/common/js/lib/adore/adore.js
// @require     http://localhost:8080/common/js/lib/adore/adore.drawing.js
// @require     http://localhost:8080/common/js/lib/adore/adore.json.js
// @require     http://localhost:8080/common/js/lib/adore/adore.navigation.js
// @require     http://localhost:8080/common/js/lib/adore/adore.json.adapters.themoviedb.org.js
// @require     http://lesscss.googlecode.com/files/less-1.3.0.min.js
// @resource    standalone-css http://localhost:8080/standalone/standalone.css
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
        });;
    });

    return dfd.promise();
}

// We check if the current page is an actors page.
$(function () {
    if (result = actor_page.exec(document.location.pathname)) {
        var currentId = result[1],
            previousId = GM_getValue("previousId");
    
        if (currentId != previousId) {
            GM_setValue("previousId", currentId);
        }

        $("#mainCol").prepend($("<div />").attr("id", "drawingArea"));

        $.extend(window.adore.config, {
            drawingArea: $("#drawingArea")
        });

        GM_addStyle(GM_getResourceText("standalone-css"));
    
        myLog("firing with ids " + currentId + " and " + previousId);
    
        fire(currentId, previousId).done(function () {
            $("#drawingArea").prepend($("<button>Prev</button>").click(function () {
                adore.navigation.navigatePaths(-1);
            }));
    
            $("#drawingArea").append($("<button>Next</button>").click(function () {
                adore.navigation.navigatePaths(1);
            }));
        });
    }
});