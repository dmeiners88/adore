/* This is the ADORE object that holds all the ADORE-specific functions and internal state information. */
var adore = (function () {

    /* The private object will hold the file contents. */
    var data = {
        skinFile: undefined,
        jsonFile: undefined
    };

    /* Here come all the function definitions. */
    function bindControls() {
        /* Binds all HTML controls to JavaScript logic. */

        $("#skinFile, #jsonFile").each(function (index, element) {
            element.onchange = loadFile;
        });

        $("#skinFileBrowseButton, #jsonFileBrowseButton").each(function (index, element) {
            element.onclick = function () {
                $("#" + element.dataset["for"]).get(0).click();
            };
        });
    }

    function setUpDraggables() {
        /* Makes some page elements draggable */
        $("#menuBox").draggable();
    }

    function loadFile(evt) {
        /* This function takes an onchange-Event and reads a file from
           the generating input field. */
        var file = evt.target.files[0];
        var fileName = evt.target.value;

        if (file) {
            var reader = new FileReader();

            /* This is a callback function. It is called when the FileReader
               object finishes its read operation. */
            reader.onload = function (f) {
                /* We store the file contents in our global data object. */
                data[evt.target.id] = f.target.result;
                $("#" + evt.target.id + "Name").text(fileName);
            };

            /* Start reading the text file. */
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + fileName);
        }
    }

    function init() {
        /* This function initializes the ADORE application */
        bindControls();
        setUpDraggables();
    }

    /* We return an anonymous object which holds references to the functions
       we want to make public. */
    return {
        init: init
    };

}());

$(function () {
    /* We call the ADORE init function inside the jQuery.ready() function to make sure
       the DOM is ready. */
    adore.init();
});