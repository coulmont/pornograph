var w = 1200,
    h = 800;

var duration = 1000;

var firstRound = true;

var transition = false;

var bbxwidth = 80, bbxheight =20, rc = 10;
var bgcol="#ffa";
var bgcolcenter="#af1";

var GraphView = Backbone.View.extend({

        el: "#graph",
        info: "#info_container",


        initialize: function () {


            _.bindAll(this, "render");
            _.bindAll(this, "tick");

            _.bindAll(this, "mouseOver");
            _.bindAll(this, "mouseOut");
            _.bindAll(this, "mouseDown");


            this.model.bind("changes", this.render);

            this.tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    return "<span style='color:red'>" + d.name + "</span>";
                });


            drag = false;

            this.svg = d3.select(this.$el.selector)
                .append("svg")
                .attr("class", "graphsvg")
                .attr("width", w)
                .attr("height", h)
                .style("background-color", "#FFFFFF")
                .append("g")
                .attr("prepare", "translate(15,10)")
                .call(this.tip);

      
      
            this.nodes = [];
            this.links = [];

            this.force = d3.layout.force()
                .nodes(this.nodes)
                .links(this.links)
                .gravity(0.05)
                .charge(-300)
                .linkDistance(120)
                .size([w, h])
                .on("tick", this.tick);


            this.nodeDrag = this.force.drag()
                .on("dragstart", this.dragStart)

                .on("dragend", this.dragEnd);


            this.node = this.svg.selectAll(".node");

            this.link = this.svg.selectAll(".link");

            this.template = $("#info_template").html();

            this.centerNodeData;

            theModel = this.model; //hack

        },

        setInfo: function (hoverNodeName,hoverNodeNumberEdges) {
            console.log("setInfo");


            $(this.info).html(_.template(this.template, {
                center_node_name: this.centerNodeData.get("name"),
                center_node_number_edges: this.centerNodeData.getNeighborhood().length,
                hover_node_name: hoverNodeName,
                hover_node_number_edges: hoverNodeNumberEdges
            }));
        },

        render: function (centerNode, data) {
            console.log("render", centerNode.get("name"));

            this.centerNodeData = centerNode;

            this.setInfo();


            var d3Data = this.prepare(data);

            var allNodesMap = d3.map();

            for (var i = this.nodes.length - 1; i >= 0; i--) {
                var node = this.nodes[i];
                if (d3Data.nodeIdMap.has(node.id)) {
                    //node already in the graph
                    node.centerNode = d3Data.nodeIdMap.get(node.id).centerNode;

                    d3Data.nodeIdMap.remove(node.id);
                    allNodesMap.set(node.id, node);

                } else {
                    //remove unnecessary node from the graph
                    this.nodes.splice(i, 1);
                }
            }

            var nn = d3Data.nodeIdMap.values();

            for (var i = 0; i < nn.length; i++) {
                //add new node to the graph
                this.nodes.push(nn[i]);
                allNodesMap.set(nn[i].id, nn[i]);
            }

            for (var i = this.links.length - 1; i >= 0; i--) {
                var edge = this.links[i];
                if (d3Data.edgeIdMap.has(edge.id)) {
                    //edge already in the graph
                    d3Data.edgeIdMap.remove(edge.id);
                } else {
                    //remove unnecessary edge from the graph
                    this.links.splice(i, 1);
                }
            }

            var ne = d3Data.edgeIdMap.values();

            for (var i = 0; i < ne.length; i++) {
                //add new edge to the graph
                var e = {source: allNodesMap.get(ne[i].source), target: allNodesMap.get(ne[i].target) };
                this.links.push(e);

            }

            this.start(centerNode);

        },

        tick: function () {
            //    console.log("tick");

            this.node.selectAll("rect")
                .attr("x", function (d) {
                    return d.x-bbxwidth/2;
                })
                .attr("y", function (d) {
                    return d.y-bbxheight/2;
                });
        this.node.selectAll("text")
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                });

            this.link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                })

        },

        start: function (centerNode) {
            console.log("start");




            this.link = this.link.data(this.force.links(), function (d) {

                return d.source.id + "-" + d.target.id;
            });

            this.link.enter().insert("line", ".node").attr("class", "link")

                .style("opacity", 0)
                .transition().duration(1000)

                .style("opacity", 1);

            this.link.exit()
                .remove();



            this.node = this.node.data(this.force.nodes(), function (d) {
                return d.id;

            });

            if (this.node.enter().empty()==false ||this.node.exit().empty() == false) {
                transition = true;
            }

 
            cg=this.node.enter()
                .append("g")
               	.attr("class", "node")

                
            cg.append("rect")
                .style("opacity", 1)
                .style("fill",bgcol)
                .attr("width",bbxwidth)
                .attr("height",bbxheight)
                .attr("rx",rc)
                .attr("ry",rc)                 
                .on('mousedown', this.mouseDown)
                .on('mouseout', this.mouseOut)
                .on("dragstart", this.dragStart)
                .on("click", this.click)
                .call(this.nodeDrag)
                .transition().duration(1000)
                .style("opacity", 1)
                .each("end",function(){transition=false;});
            
            cg.append("text")
                .style("opacity", 1)
                .style("fill","#000")
                .text(function(d){return d.name})
                .style("text-anchor","middle")
                .style("dominant-baseline","middle")
                     .on('mousedown', this.mouseDown)
                .on('mouseout', this.mouseOut)
                .on("dragstart", this.dragStart)
                .on("click", this.click)
                .call(this.nodeDrag)
                .transition().duration(1000)
                .style("opacity", 1)
                .each("end",function(){transition=false;});
    
            this.node.each(function(d) {
                if (d.centerNode==false) {
                  d3.select(this).selectAll("rect").style("fill",bgcol)
                } else if (firstRound) {
                  d3.select(this).selectAll("rect").style("fill",bgcolcenter)
                    firstRound  =false;
                }
            });



  

            this.node.exit().transition().duration(1000).style("opacity", 0)
                .each("end",function(){transition=false;})
                .remove();

            this.force.start()
        },

        dragStart: function () {
            if(transition) return;
            drag = true;
        },

        dragEnd: function (d) {
            drag = false;
        },

        mouseOver: function (d) {

           console.log("mouseOver",d);

            if(transition) return;
            if (drag == false) {
                this.tip.show(d);
                d.fixed = true;
                this.setInfo(d.name, d.numberOfEdges);
            }

        },

        mouseDown: function(d) {

        },

        mouseOut: function (d) {
            console.log("mouseOut",d3.event.fromElement);
            if(transition) return;
            if(drag == false) {

            this.tip.hide();
             d.fixed = false;
            this.setInfo();
            }
        },


        click: function (d) {
            console.log("click", d3.event);
            if(transition) return;

            if (d3.event.defaultPrevented) return;

            d3.select(this.parentNode).selectAll("rect").style("fill",bgcolcenter)
            console.log(d.id)
            theModel.fetch(d.id, $('#max-distance option:selected').text());
        },

        prepare: function (modelData) {
            //   console.log("prepare", modelData);


            var nodeIdMap = d3.map();
            var edgeIdMap = d3.map();

            var id2index = d3.map();

            for (var i = 0; i < modelData.length; i++) {
                var id = modelData[i].id;
                var name = modelData[i].get("name");
                var color = modelData[i].get("color");
                var noe = modelData[i].getNeighborhood().length;

                var node = {id: id, name: name, color: color,numberOfEdges: noe,
                centerNode: i==0
                };

                nodeIdMap.set(id, node);

            }

            for (var i = 0; i < modelData.length; i++) {

                var nodeA = modelData[i];

                var neighborhood = nodeA.getNeighborhood();

                for (var j = 0; j < neighborhood.length; j++) {
                    var nodeB = neighborhood.at(j);

                    if (nodeIdMap.has(nodeB.id) && nodeA.cid.localeCompare(nodeB.cid) > 0) {

                        var sourceId = nodeA.id;
                        var targetId = nodeB.id;

                        var id = sourceId + "-" + targetId;
                        var edge = {source: sourceId, target: targetId, id: id  };

                        edgeIdMap.set(id, edge);

                    }
                }

            }

            return {nodeIdMap: nodeIdMap, edgeIdMap: edgeIdMap};

        }

    })
    ;

