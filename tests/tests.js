module("Empty JSON data set is processed correctly.", {
    setup: function () {
        var emptyJson = "{}",
        $fixture = $("#qunit-fixture"),
        c = { drawingArea: $fixture };

        ok(adore, "Global ADORE object exists.");

        equal(adore.getActivePathIndex(), -1, "activePathIndex has correct initial value of -1.");
        equal(adore.getPathCount(), -1, "pathCount has correct initial value of -1.");

        adore.setConfig(c);
        adore.setJsonData(emptyJson);

        equal(adore.getPathCount(), 0, "after setJsonData() pathCount hat correct value of 0.");
        equal(adore.getActivePathIndex(), -1, "and activePathIndex has correct value of -1.");

        adore.drawFromJson();
        equal($fixture.children().length, 0, "after drawFromJson() no paths are appended to the drawing area.")
    },
    teardown: function () {
        var $fixture = $("#qunit-fixture");
        adore.reset();
        equal(adore.getActivePathIndex(), -1, "after reset() activePathIndex has correct value of -1.");
        equal(adore.getPathCount(), -1, "and pathCount has correct value of -1.");
        equal($fixture.children().length, 0, "and no paths are appended to the drawing area.");
    }
});

test("Paths are created correctly.", function () {
});

test("Path switching works correctly (internal state is updated correctly).", function () {
    adore.switchToNextPath();
    equal(adore.getActivePathIndex(), -1,
        "after switchToNextPath() activePathIndex retains correct value of -1.");

    adore.switchToPreviousPath();
    equal(adore.getActivePathIndex(), -1,
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

        equal(adore.getActivePathIndex(), -1, "activePathIndex has correct initial value of -1.");
        equal(adore.getPathCount(), -1, "pathCount has correct initial value of -1.");

        adore.setConfig(c);
        adore.setJsonData(complexJson);

        equal(adore.getPathCount(), 3, "after setJsonData() pathCount has correct value of 3.");
        equal(adore.getActivePathIndex(), -1, "and activePathIndex has correct value of -1");

        adore.drawFromJson();
        equal(adore.getActivePathIndex(), 0, " after drawfromJson() activePathIndex has correct value of 0.");
        equal($fixture.children(".path").length, 3,
            "and 3 paths div's have been appended to the drawing area.");
    },
    teardown: function () {
        var $fixture = $("#qunit-fixture");
        adore.reset();
        equal(adore.getActivePathIndex(), -1, "after reset() activePathIndex has correct value of -1.");
        equal(adore.getPathCount(), -1, "and pathCount has correct value of -1.");
        equal($fixture.children().length, 0, "and no paths are appended to the drawing area.");
    }
});

test("Paths are created correctly.", function () {
});

test("Path switching works correctly (internal state is updated correctly).", function () {
    adore.switchToNextPath();
    equal(adore.getActivePathIndex(), 1, "after switchToNextPath() activePathIndex has correct value of 1.");

    adore.switchToNextPath();
    equal(adore.getActivePathIndex(), 2, "after switchToNextPath() activePathIndex has correct value of 2.");

    adore.switchToNextPath();
    equal(adore.getActivePathIndex(), 2,
        "after switchToNextPath() activePathIndex retains correct value of 2 (maximum path index was hit).");

    adore.switchToPreviousPath();
    equal(adore.getActivePathIndex(), 1, "after switchToPreviousPath() activePathIndex has correct value of 1.");

    adore.switchToPreviousPath();
    equal(adore.getActivePathIndex(), 0, "after switchToPreviousPath() activePathIndex has correct value of 0.");

    adore.switchToPreviousPath();
    equal(adore.getActivePathIndex(), 0,
        "after switchToPreviousPath() activePathIndex retains correct value of 0 (minimum path index was hit).");
});

test("Path switching  works correctly (visibility of paths on screen is changed correctly).", function () {
    var $fixture = $("#qunit-fixture");
    equal($fixture.children(".path:visible")[0].id, "path1", "after drawFromJson() the first path is visible.");
    equal($fixture.children(".path:hidden")[0].id, "path2", "and the second path is hidden.");
    equal($fixture.children(".path:hidden")[1].id, "path3", "and the third path is hidden.");
});