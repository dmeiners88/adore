module("Empty JSON data set is processed correctly.", {
    setup: function () {
        var emptyJson = "{}",
        $fixture = $("#qunit-fixture"),
        c = { drawingArea: $fixture };

        ok(adore, "Global ADORE object exists.");

        equal(adore.state.activePathIndex, -1,
            "activePathIndex has correct initial value of -1.");
        equal(adore.state.pathCount, -1,
            "pathCount has correct initial value of -1.");

        $.extend(adore.config, c);
        adore.json.set(emptyJson);

        equal(adore.state.pathCount, 0,
            "after setJsonData() pathCount has correct value of 0.");
        equal(adore.state.activePathIndex, -1,
            "and activePathIndex has correct value of -1.");

        adore.drawing.draw();
        equal($fixture.children().length, 0,
            "after drawFromJson() no paths are appended to the drawing area.")
        equal(adore.state.pathCount, 0,
            "and pathCount has correct value of 0.");
        equal(adore.state.activePathIndex, -1,
            "and activePathIndex has correct value of -1");
    },
    teardown: function () {
        var $fixture = $("#qunit-fixture");
        adore.reset();
        equal(adore.state.activePathIndex, -1,
            "after reset() activePathIndex has correct value of -1.");
        equal(adore.state.pathCount, -1,
            "and pathCount has correct value of -1.");
        equal($fixture.children().length, 0,
            "and no paths are appended to the drawing area.");
    }
});

test("No paths are created.", 11, function () {
});

test("Path switching updates internal state correctly.", 11+2, function () {
    adore.navigation.switchToNextPath();
    equal(adore.state.activePathIndex, -1,
        "after switchToNextPath() activePathIndex retains correct value of -1.");

    adore.navigation.switchToPreviousPath();
    equal(adore.state.activePathIndex, -1,
        "after switchToPreviousPath() activePathIndex retains correct value of -1.");
});

module("Complex JSON data set is processed correctly.", {
    setup: function () {
        var complexJson = "{ \
                         \"nodes\": \
                         [ \
                             { \"id\": \"author2\", \"label\": \"Author 2\",  \"class\": \"author\" }, \
                             { \"id\": \"paperA\", \"label\": \"Paper A\", \"class\": \"paper\"  }, \
                             { \"id\": \"paperB\", \"label\": \"Paper B\", \"class\": \"paper\"  }, \
                             { \"id\": \"paperC\", \"label\": \"Paper C\", \"class\": \"paper\"  }, \
                             { \"id\": \"conferenceA\", \"label\": \"Conf A\", \"class\": \"conference\" }, \
                             { \"id\": \"conferenceB\", \"label\": \"Conf B\", \"class\": \"conference\" } \
                         ], \
                         \"edges\": \
                         [ \
                             { \"id\": \"edge1\", \"from\": { \"$ref\": \"author2\" }, \"to\": { \"$ref\": \"paperA\" }, \"class\": \"authorship\" }, \
                             { \"id\": \"edge2\", \"from\": { \"$ref\": \"paperA\" }, \"to\": { \"$ref\": \"paperB\" }, \"class\": \"citation\" }, \
                             { \"id\": \"edge3\", \"from\": { \"$ref\": \"paperA\" }, \"to\": { \"$ref\": \"paperC\" }, \"class\": \"citation\" }, \
                             { \"id\": \"edge4\", \"from\": { \"$ref\": \"paperB\" }, \"to\": { \"$ref\": \"conferenceA\" }, \"class\": \"presentation\" }, \
                             { \"id\": \"edge5\", \"from\": { \"$ref\": \"paperC\" }, \"to\": { \"$ref\": \"conferenceA\" }, \"class\": \"presentation\" }, \
                             { \"id\": \"edge6\", \"from\": { \"$ref\": \"paperA\" }, \"to\": { \"$ref\": \"conferenceA\" }, \"class\": \"presentation\" } \
                         ], \
                         \"paths\": \
                         [ \
                             { \"id\": \"path1\", \"edges\": [ { \"$ref\": \"edge1\" }, { \"$ref\": \"edge3\" }, { \"$ref\": \"edge5\" } ] }, \
                             { \"id\": \"path2\", \"edges\": [ { \"$ref\": \"edge1\" }, { \"$ref\": \"edge2\" }, { \"$ref\": \"edge4\" } ] }, \
                             { \"id\": \"path3\", \"edges\": [ { \"$ref\": \"edge1\" }, { \"$ref\": \"edge6\" }] } \
                         ] \
                      }",
            $fixture = $("#qunit-fixture"),
            c = { drawingArea: $fixture };

        ok(adore, "Global ADORE object exists.");

        equal(adore.state.activePathIndex, -1,
            "activePathIndex has correct initial value of -1.");
        equal(adore.state.pathCount, -1,
            "pathCount has correct initial value of -1.");

        $.extend(adore.config, c);
        adore.json.set(complexJson);

        equal(adore.state.pathCount, 3,
            "after setJsonData() pathCount has correct value of 3.");
        equal(adore.state.activePathIndex, -1,
            "and activePathIndex has correct value of -1");

        adore.drawing.draw();
        equal(adore.state.activePathIndex, 0,
            "after drawfromJson() activePathIndex has correct value of 0.");
        equal(adore.state.pathCount, 3,
            "and pathCount has correct value of 3.");
        equal($fixture.children(".path").length, 3,
            "and 3 paths div's have been appended to the drawing area.");
    },
    teardown: function () {
        var $fixture = $("#qunit-fixture");
        adore.reset();
        equal(adore.state.activePathIndex, -1,
            "after reset() activePathIndex has correct value of -1.");
        equal(adore.state.pathCount, -1,
            "and pathCount has correct value of -1.");
        equal($fixture.children().length, 0,
            "and no paths are appended to the drawing area.");
    }
});

test("Paths, nodes and edges are created correctly.", 11+6, function () {

    equal($("#path1").children(".node").length, 4,
        "first path has 4 nodes.");

    equal($("#path1").find("._jsPlumb_connector").length, 3,
        "and 3 edges.");

    equal($("#path2").children(".node").length, 4,
        "second path has 4 nodes.");

    equal($("#path2").find("._jsPlumb_connector").length, 3,
        "and 3 edges.");

    equal($("#path3").children(".node").length, 3,
        "third path has 3 nodes.");

    equal($("#path3").find("._jsPlumb_connector").length, 2,
        "and 2 edges.");
});

test("Path switching updates internal state correctly.", 11+6, function () {
    adore.navigation.switchToNextPath();
    equal(adore.state.activePathIndex, 1,
        "after switchToNextPath() activePathIndex has correct value of 1.");

    adore.navigation.switchToNextPath();
    equal(adore.state.activePathIndex, 2,
        "after switchToNextPath() activePathIndex has correct value of 2.");

    adore.navigation.switchToNextPath();
    equal(adore.state.activePathIndex, 2,
        "after switchToNextPath() activePathIndex retains correct value of 2 (maximum path index was hit).");

    adore.navigation.switchToPreviousPath();
    equal(adore.state.activePathIndex, 1,
        "after switchToPreviousPath() activePathIndex has correct value of 1.");

    adore.navigation.switchToPreviousPath();
    equal(adore.state.activePathIndex, 0,
        "after switchToPreviousPath() activePathIndex has correct value of 0.");

    adore.navigation.switchToPreviousPath();
    equal(adore.state.activePathIndex, 0,
        "after switchToPreviousPath() activePathIndex retains correct value of 0 (minimum path index was hit).");
});

test("Path switching  updates visibility of paths on screen correctly.", 11+15, function () {
    // We disable all jQuery animations as they interfer with the test runner.
    $.fx.off = true;

    ok($("#path1").is(":visible"), "and the first path is visible.");
    ok($("#path2").is(":hidden"), "and the second path is hidden.");
    ok($("#path3").is(":hidden"), "and the third path is hidden.");

    adore.navigation.switchToNextPath();
    ok($("#path1").is(":hidden"), "after switchToNextPath() the first path is hidden.");
    ok($("#path2").is(":visible"), "and the second path is visible.");
    ok($("#path3").is(":hidden"), "and the third path is hidden.");

    adore.navigation.switchToNextPath();
    ok($("#path1").is(":hidden"), "after switchToNextPath() the first path is hidden.");
    ok($("#path2").is(":hidden"), "and the second path is hidden.");
    ok($("#path3").is(":visible"), "and the third path is visible.");

    adore.navigation.switchToNextPath();
    ok($("#path1").is(":hidden"),
        "after switchToNextPath() the first path stays hidden (maximum path index was hit).");
    ok($("#path2").is(":hidden"), "and the second path is hidden.");
    ok($("#path3").is(":visible"), "and the third path is visible.");

    adore.navigation.switchToPreviousPath();
    ok($("#path1").is(":hidden"), "after switchToPreviousPath() the first path is hidden.");
    ok($("#path2").is(":visible"), "and the second path is visible.");
    ok($("#path3").is(":hidden"), "and the third path is hidden.");
});