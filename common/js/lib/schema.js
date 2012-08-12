// Although this is a JSON schema, it is notated like an AMD-compliant module.
// This way it can be loaded easily with require.js

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        // Non-AMD. Store JSON Schema as browser global.
        root.adore = root.adore || {};
        root.adore.schema = factory;
    }
}(this, {
    "name": "data",
    "properties":
    {
        "nodes":
        {
            "type": "array",
            "description": "This array holds all the nodes we want to draw.",
            "required": true,
            "items":
            {
                "type": "object",
                "description": "A single node object",
                "id": "nodeType",
                "properties":
                {
                    "id":
                    {
                        "type": "string",
                        "required": true,
                        "description": "A unique ID for this node."
                    },
                    "label":
                    {
                        "type": "string",
                        "required": true,
                        "description": "The label with which the node is decorated."
                    },
                    "class":
                    {
                        "type": "string",
                        "required": false,
                        "description": "The CSS class of this node. Used for skinning purposes."
                    },
                    "attributes":
                    {
                        "type": "array",
                        "required": false,
                        "description": "An array of additional attributes for this node.",
                        "items":
                        {
                            "type": "object",
                            "description": "A single attribute name-value pair.",
                            "properties":
                            {
                                "name":
                                {
                                    "type": "string",
                                    "required": true,
                                    "description": "The attribute name."
                                },
                                "value":
                                {
                                    "type": "string",
                                    "required": true,
                                    "description": "The attribute value."
                                }
                            }
                        }
                    }
                }
            }
        },
        "edges":
        {
            "type": "array",
            "description": "This array holds all the edges we want to draw.",
            "required": true,
            "items":
            {
                "type": "object",
                "description": "A single edge.",
                "id": "edgeType",
                "properties":
                {
                    "id":
                    {
                        "type": "string",
                        "required": true,
                        "description": "A unique ID for this edge."
                    },
                    "from": { "$ref": "nodeType" },
                    "to": { "$ref": "nodeType" },
                    "class":
                    {
                        "type": "string",
                        "required": false,
                        "description": "The CSS class of this edge. Used for skinning purposes."
                    },
                    "label":
                    {
                        "type": "string",
                        "required": false,
                        "description": "A label for this edge. Used as an alternative to the CSS class-based skinning."
                    }
                }
            }
        },
        "paths":
        {
            "type": "array",
            "description": "This array joins edges to paths.",
            "required": true,
            "items":
            {
                "type": "object",
                "properties":
                {
                    "id":
                    {
                        "type": "string",
                        "required": true,
                        "description": "A unique ID for this path."
                    },
                    "edges":
                    {
                        "type": "array",
                        "description": "This array holds all the edges (specifically references to the IDs of the edges) belonging to this path.",
                        "additionalItems": false,
                        "items": { "$ref": "edgeType" }
                    }
                }
            }
        }
    }
}));