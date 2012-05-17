jsPlumb.ready(function() {
    $(".box").css("left", function() {
        return $(window).width() * Math.random() + "px";
    });

    $(".box").css("top", function() {
        return $(window).height() * Math.random() + "px";
    });

    $(".box").css("background-image", function(index) {
        return "url('http://placehold.it/60x60&text=" + (index + 1).toString() + "')";
    });

    var common = {
        endpoint: [ "Dot", { radius: 5} ],
        anchor: "AutoDefault"
    };

    jsPlumb.draggable(jsPlumb.getSelector(".box"));
    jsPlumb.connect({ source: "box1", target: "box2" }, common);
    jsPlumb.connect({ source: "box1", target: "box3" }, common);
    jsPlumb.connect({ source: "box2", target: "box3" }, common);
});