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
// @version     0.1
// @updateURL   http://localhost:8080/userscript/themoviedb.org.meta.js
// ==/UserScript==

var api_key    = "c69cd982c351c47ccd809268cc49fda2",
    actor_page = /^\/person\/(\d+)-.*/,
    adore      = window.adore;

// Utility functions
function makeFlatArray(array) {
    return $.map(array, function (elem) {
        return elem.id;
    });
}

function getEntryViaId(array, id) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i].id == id) {
            return array[i];
        }
    }
}

// Taken and modified from https://github.com/ossreleasefeed/UtilsjS/blob/master/js/arrayUtils.js
function arrayMatcher (firstArray, secondArray) {
    var results = [], 
    firstArrayLength = firstArray.length, 
    secondArrayLength = secondArray.length,
    loopArray = firstArrayLength > secondArrayLength ? secondArray : firstArray,
    matchArray = firstArrayLength < secondArrayLength ? secondArray : firstArray,
    arrayLength = loopArray.length;

    for(var j = 0; j < arrayLength; j++) {
        if($.inArray(firstArray[j], secondArray) > -1) {
            results.push(firstArray[j]);
        }
    }   
    return results;
}

function myLog(msg) {
    console.log("themoviedb.org userscript: " + msg);
}

// TheMovieDB.org API wrapping functions
function getPersonInfo(id) {
    var dfd = $.Deferred();

    $.getJSON("http://api.themoviedb.org/3/person/" + id + "?api_key=" + api_key, function (result) {
        dfd.resolve(result);
    });

    return dfd.promise();
}

function getPersonCredits(id) {
    var dfd = $.Deferred();

    $.getJSON("http://api.themoviedb.org/3/person/" + id + "/credits?api_key=" + api_key, function (result) {
        dfd.resolve(result);
    });

    return dfd.promise();
}

function getCommonMovies(firstId, secondId) {
    var dfd = $.Deferred();

    $.when(getPersonCredits(firstId), getPersonCredits(secondId)).then(function (credits1, credits2) {
        var arr1 = makeFlatArray(credits1.cast),
            arr2 = makeFlatArray(credits2.cast),
            common = arrayMatcher(arr1, arr2);
        
        // We have the id's of the common movies, let's build an ADORE compatible data set
        var dataset = {
            nodes: [
                // Both actors need to be added as nodes
                {
                    id: "person-" + firstId
                }
            ],
            edges: [],
            paths: []
        };

        for (var i = 0; i < common.length; i += 1) {
            dataset.nodes.push({
                id: "movie-" + common[i],
                label: getEntryViaId(credits1.cast, common[i]).title,
                "class": "movie id-" + common[i]
            });
        }

        dfd.resolve(dataset);
    });

    return dfd.promise();
}

// We check if the current page is an actors page.
if (result = actor_page.exec(document.location.pathname)) {
    var currentId = result[1],
        previousId = GM_getValue("previousId");

    if (currentId != previousId) {
        GM_setValue("previousId", currentId);
        getCommonMovies(previousId, currentId);
    }
}