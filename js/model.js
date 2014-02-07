
var GraphModel = Backbone.Model.extend({
        defaults: {

            nodes: [],
            relations: [],
            centerId: -1
        },

        initialize: function () {
            var nodes = this.get("nodes");
            var relations = this.get("relations");

            this.nodeCollection = new NodeCollection();

            var indexMapping = d3.map();

            for (var i = 0; i < nodes.length; i++) {
                var n = new Node({name: nodes[i].name, id: nodes[i].id});
                this.nodeCollection.add(n);
                indexMapping.set(nodes[i].id, n);
            //    console.log(nodes[i].id, n);
            }

            for (var i = 0; i < relations.length; i++) {
                var nodeA = indexMapping.get(relations[i][0]);
                var nodeB = indexMapping.get(relations[i][1]);

                nodeA.addNeighbor(nodeB);
                nodeB.addNeighbor(nodeA);
            }

        },

        fetch: function (id, distance) {
            console.log("fetch", id, distance);
            this.centerId = id;

            n = this.nodeCollection.get(id);

            this.subNodeCollection = this.getNeighborhood(n, distance);

            this.trigger("changes",n,this.subNodeCollection.models);

        },

        distanceChange: function(distance) {
            console.log("distanceChange",distance);
           this.fetch(this.centerId,distance);
        },

        getNeighborhood: function (center, distance) {
            console.log("getNeighborhood", center);
            neighborhood = new NodeCollection();

            borderNodes = d3.map();

            jobs = [
                {node: center, depth: 0}
            ];

            neighborhood.add(center);

            while (jobs.length > 0) {
                job = jobs.shift();

                if (job.depth < distance) {
                    nh = job.node.getNeighborhood();

                    for (var i = 0; i < nh.length; i++) {
                        var nodeB = nh.at(i);
                        if (neighborhood.get(nodeB.id) == undefined) {

                            neighborhood.add(nodeB);
                            jobs.push({node: nodeB, depth: job.depth + 1});
                        }

                    }

                }

            }


            return neighborhood;

        }

    })
    ;

var Node = Backbone.Model.extend({

    idAttribute: "id",

    defaults: {

    },
    initialize: function () {
        this.neighborhood = new NodeCollection();
        this.set("color", randomBlue());
    },

    addNeighbor: function (n) {
        //  console.log("addNeighbour");
        this.neighborhood.add(n);
    },

    removeNeighbor: function (n) {
        //  console.log("removeNeighbour");
        this.neighborhood.remove(n);
    },

    getNeighborhood: function () {
        //  console.log("getNeighborhood");
        return this.neighborhood;
    },

    setNeighborhood: function (nh) {
        //  console.log("getNeighborhood");
        this.neighborhood = nh;
    }

});

var NodeCollection = Backbone.Collection.extend({

    model: Node

});

function randomBlue() {

    var allowed = "456789ABCDE", S = "#0000";

    while (S.length < 7) {
        S += allowed.charAt(Math.floor((Math.random() * 16) + 1));
    }
    return S;
}



