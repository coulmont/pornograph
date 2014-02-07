$(function () {

    var nodes = [

        {id:0 ,name: "Adam"},
        {id:1 ,name: "Bob"},
        {id:"2p" ,name: "Carrie"},
        {id:3 ,name: "Donovan"},
        {id:4 ,name: "Edward"},
        {id:5 ,name: "Felicity"},
        {id:6 ,name: "George "},
        {id:7 ,name: "Iris "},
        {id:8 ,name: "Hannah"},
        {id:9 ,name: "Jerry"},
        {id:10 ,name: "Baptiste "},
        {id:11 ,name: "Anne"},
        {id:12 ,name: "Simon"}        
    ];
    var relations = [
        [0, 1],
        [0, "2p"],
        [0, 3],
        [0, 4],
        [1, 5],
        ["2p", 5],
        [3, 4],
        [5, 9],
        [5, 8],
        [6, 7],
        [6, 9],
        [7, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        [10, 12],
        [12, 9],
        [12, 1]
    ];

    var graphModel = new GraphModel(
        {
            nodes: nodes,
            relations: relations
        });

    new GraphView({
        model: graphModel

    });

    distanceChange = function() {
        graphModel.distanceChange($('#max-distance option:selected').text());

    }

    graphModel.fetch("2p",$('#max-distance option:selected').text());


});
