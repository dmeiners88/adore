;(function (namespace, undefined) {
    "use strict";

    namespace.json = namespace.json || {};
    namespace.json.adapters = namespace.json.adapters || {};
    namespace.json.adapters.themoviedb = namespace.json.adapters.themoviedb || {};
    
    var themoviedb = namespace.json.adapters.themoviedb.org = {},
        api_key = "",
        configuration = null;

    $(function () {

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
        
        // API wrappers
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

        function getConfiguration() {
            var dfd = $.Deferred();

            if (!configuration) {
                $.getJSON("http://api.themoviedb.org/3/configuration?api_key=" + api_key, function (result) {
                    configuration = result;
                    dfd.resolve(result);
                });
            } else {
                dfd.resolve(configuration);
            }

            return dfd.promise();
        }

        function buildPersonImagePath(personInfo) {
            var dfd = $.Deferred();

            getConfiguration().done(function (result) {
                dfd.resolve(result.images.base_url + "w154" + personInfo.profile_path);
            });

            return dfd.promise();
        }

        function buildMovieImagePath(personCredits, movieId) {
            var dfd = $.Deferred();

            getConfiguration().done(function (result) {
                dfd.resolve(result.images.base_url + "w154" + getEntryViaId(personCredits.cast, movieId).poster_path);
            });

            return dfd.promise();
        }

        function getCommonMovies(firstId, secondId) {
            var dfd = $.Deferred(),
                dataset = {};
        
            $.when(getPersonCredits(firstId),
                getPersonCredits(secondId),
                getPersonInfo(firstId),
                getPersonInfo(secondId))
            .then(function (credits1, credits2, info1, info2) {
                    var arr1 = makeFlatArray(credits1.cast),
                        arr2 = makeFlatArray(credits2.cast),
                        common = arrayMatcher(arr1, arr2);
                
                    // We have the id's of the common movies, let's build an ADORE compatible data set
                    dataset = {
                        nodes: [
                            // Both actors need to be added as nodes
                            { id: "person-" + firstId, label: info1.name, "class": "person person-id-" + firstId },
                            { id: "person-" + secondId, label: info2.name, "class": "person person-id-" + secondId }
                        ],
                        edges: [],
                        paths: []
                    };
            
                    // Add the movie nodes
                    for (var i = 0; i < common.length; i += 1) {
                        // Add a movie node to the dataset
                        var newLength = dataset.nodes.push({
                            id: "movie-" + common[i],
                            label: getEntryViaId(credits1.cast, common[i]).title,
                            "class": "movie movie-id-" + common[i]
                        });
            
                        // Add the edges connecting this movie to both actors
                        var firstEdgeId = "person-" + firstId + "-" + "movie-" + common[i],
                            secondEdgeId = "movie-" + common[i] + "-" + "person-" + secondId;
                        var firstEdgeCount = dataset.edges.push({
                            id: firstEdgeId,
                            from: dataset.nodes[0],
                            to: dataset.nodes[newLength - 1],
                            "class": "stars-in"
                        });
            
                        var secondEdgeCount = dataset.edges.push({
                            id: secondEdgeId,
                            from: dataset.nodes[newLength - 1],
                            to: dataset.nodes[1],
                            "class": "has-actor"
                        });
            
                        // Lastly, we build the paths
                        dataset.paths.push({
                            id: "path-" + i,
                            edges: [
                                dataset.edges[firstEdgeCount - 1],
                                dataset.edges[secondEdgeCount - 1]
                            ]
                        });
                    }
            
                    dfd.resolve(dataset, nodeImages);
            });
        
            return dfd.promise();
        }

        function setApiKey(apiKey) {
            api_key = apiKey;
        }

        themoviedb.setApiKey = setApiKey;
        themoviedb.getCommonMovies = getCommonMovies;

    });
}(window.adore = window.adore || {}));