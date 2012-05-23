/* This is the ADORE object that holds all the ADORE-specific functions and internal state information. */
adore = (function() {

    /* Here come all the private properties. */
    var skinFileContents,
        jsonFileContents;
    
    /* Here come all the function definitions. */
    function bindControls() {
        /* Binds all HTML controls to their corresponding JavaScript function. */

        $("#skinFile").change(function (evt) {
            skinFileContents = loadFile(evt);
            $("#fileContents").text(skinFileContents);
        });
    }

    function loadFile(inputId) {
        /* Read a file from the file input field with the given ID and return the
           file contents. */

        var file = inputId.target.files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = (function(f) {
                console.log("Sucessfully read from file " + inputId.target.value);
                //return f.target.result;
                skinFileContents = f.target.result;
            });
            reader.readAsText(file);
        }
        else {
            console.error("Failed to load file from input " + inputId);
        }
    }

    function init() {
        bindControls();
    }

    /* We return an anonymous object which holds references to the functions
       we want to make public. */
    return {
        init: init
    }

})();

$(function() {
    adore.init();
});