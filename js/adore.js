// This is the ADORE object that holds all the ADORE-specific functions and internal state information.
var adore = (function () {

    // This private object will hold the file contents.
    var data = {
        skinFile: undefined,
        jsonFile: undefined
    };

    // Here come all the function definitions.

    // Binds all HTML controls to JavaScript logic.
    function bindControls() {

        $("#skinFile, #jsonFile").each(function (index, element) {
            element.onchange = loadFile;
        });

        $("#skinFileBrowseButton, #jsonFileBrowseButton").each(function (index, element) {
            element.onclick = function () {
                $("#" + element.dataset["for"]).get(0).click();
            };
        });
    }

    // Makes some page elements draggable.
    function setUpDraggables() {
        $("#menuBox").draggable();
    }

    // This function takes an onchange-event and reads a file from
    // the input field that fired the event.
    function loadFile(evt) {
        var file = evt.target.files[0];
        var fileName = evt.target.value;

        if (file) {
            var reader = new FileReader();

            // We assign a callback function to the onload event of the FileReader.
            // It is called when the FileReader object finishes its read operation.
            reader.onload = function (f) {
                // We store the file contents in our global data object.
                data[evt.target.id] = f.target.result;
                $("#" + evt.target.id + "Name").text(fileName);
            };

            // Start reading the text file.
            reader.readAsText(file);
        } else {
            console.error("adore: failed to load from file" + fileName);
        }
    }

    // This function initializes the ADORE application.
    function init() {
        bindControls();
        setUpDraggables();
    }

    // We return an anonymous object which holds references to the functions
    // we want to make public.
    return {
        init: init
    };

}());

// We call the ADORE init function inside the jQuery.ready() function to make sure
// the DOM is ready.
$(function () {
    adore.init();
});