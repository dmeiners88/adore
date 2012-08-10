// adore/json.js contains all JSON-related functionality like JSON validation.

define(["jquery", "json.ref"], function ($) {
    "use strict";

    // This function validates the current JSON data set and calls the given callback function
    // when finished.
    function validateJsonData(jsonData, jsonSchema, validationCallback) {
        var environmentId = "json-schema-draft-03",
            jsonUri = "JsonInstance",
            schemaUri = "JsonSchema";

        // If the JSON schema has not been loaded yet, we load it with an AJAX request
        // TODO: Test seems not to work at the moment.
        if (!jsonSchema.hasOwnProperty("properties")) {
            $.ajax({
                success: function (data, textStatus, jqXHR) {
                    jsonSchema = data;
                    console.log("adore: scuccessfully loaded JSON schema via AJAX.");

                    var environment = JSV.createEnvironment(environmentId);
                    var jsonInstance = environment.createInstance(jsonData, jsonUri);
                    var jsonSchemaInstance = environment.createSchema(jsonSchema, null, schemaUri);

                    var report = environment.validate(jsonInstance, jsonSchemaInstance);

                    if ($.isFunction(validationCallback)) {
                        validationCallback(report);
                    }

                    return report.errors.length;
                },
                dataType: "json",
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("adore: error loading JSON schema via AJAX. Status was: " + textStatus
                        + ". Error was: " + errorThrown + ".");
                },
                // TODO: BAD! Hard-coded path!
                url: "http://localhost:8080/json-schema/schema.json"
            });
        }
    }

    function parseJson(json) {
        return $.fromJsonRef(json);
    }

    return {
        validateJsonData: validateJsonData,
        parseJson: parseJson
    }
});