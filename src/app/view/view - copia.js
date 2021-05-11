import $ from "jquery";
import * as d3 from "d3";
import Force from 'd3-force';

var width = window.innerWidth;
var height = window.innerHeight;
var color = d3.scaleOrdinal(d3.schemePastel1);
var maxChilds = 0;

function setParentsValue(graph, d) {
  var result = graph.nodes.findIndex(obj => {
    return obj.id === d.p
  })

  if(result > -1) {

    let parent = graph.nodes[result];

    if(graph.nodes[result].hasOwnProperty('value')) {
      graph.nodes[result]['value']++;

      if(graph.nodes[result]['value'] > maxChilds)
        maxChilds = graph.nodes[result]['value'];
    } else
      graph.nodes[result]['value'] = 1;

    if(parent.hasOwnProperty('p'))
      setParentsValue(graph, parent);
  }
}

d3.json("./data/langs-relations.json").then(function(graph) {
  init(graph);
});

function init(graph){

  let links = [];

  graph.nodes[0].fx = width / 4;
  graph.nodes[0].fy = height / 4;

  graph.nodes.forEach(function(d, i) {

    setParentsValue(graph, d);

    links.push({
      "source": (d.hasOwnProperty('p') ? d.p : d.id),
      "target": d.id,
      "value": Math.ceil(Math.random()*10)
    });
  });

  graph.links = links;

  var label = {
    'nodes': [],
    'links': []
  };

  graph.nodes.forEach(function(d, i) {
    label.nodes.push({
      node: d
    });
    label.nodes.push({
      node: d
    });
    label.links.push({
      source: i * 2,
      target: i * 2 + 1
    });
  });

  var labelLayout = d3.forceSimulation(label.nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink(label.links).distance(0).strength(2));

  var graphLayout = d3.forceSimulation(graph.nodes)
    .force("charge", d3.forceManyBody().strength(function(d, i){
      return d.hasOwnProperty('value') ? -(d.value / maxChilds) * 6000 - 3000 : -3000
    }))
    //.force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(1))
    .force("y", d3.forceY(height / 2).strength(1))
    .force("link", d3.forceLink(graph.links).id(function(d) {
      return d.id;
    })
    .distance(100)
    .strength(1))
    .on("tick", ticked);

  var adjlist = [];

  graph.links.forEach(function(d) {
    adjlist[d.source.index + "-" + d.target.index] = true;
    adjlist[d.target.index + "-" + d.source.index] = true;
  });

  function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
  }

  var svg = d3.select("#viz").attr("width", width).attr("height", height);
  var container = svg.append("g");

    svg.call(
      d3.zoom()
          .scaleExtent([.1, 4])
          .on("zoom", function() { container.attr("transform", d3.event.transform); })
  );

  var link = container.append("g").attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke", "#ddd")
    .attr("stroke-width", "1px");

  var node = container.append("g").attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", function(d) {
      return d.hasOwnProperty('value') ? (d.value / maxChilds) * 20 + 20 : 20
    })
    .attr("fill", function(d) {
      return color(d.group);
    })

  container.selectAll("circle").filter(function(d, i) {
    return i == 0
  })

  //node.on("mouseover", focus).on("mouseout", unfocus);

  node.call(
    d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
  );

  var labelNode = container.append("g").attr("class", "labelNodes")
    .selectAll("text")
    .data(label.nodes)
    .enter()
    .append("text")
    .text(function(d, i) {
      return i % 2 == 0 ? "" : d.node.id;
    })
    .style("fill", "#111")
    .style("font-family", "Arial")
    .style("font-size", function(d, i) {
      return d.node.hasOwnProperty('value') && d.node['value'] >= maxChilds ? 24 : 12
    })
    .style("pointer-events", "none"); // to prevent mouseover/drag capture

  //node.on("mouseover", focus).on("mouseout", unfocus);

  function ticked() {

    node.call(updateNode);
    link.call(updateLink);

    labelLayout.alphaTarget(0.3).restart();
    labelNode.each(function(d, i) {
      var b = this.getBBox();
      d.x = d.node.x - b.width / 2;
      d.y = d.node.y + b.height / 4;
    });
    labelNode.call(updateNode);

  }

  function fixna(x) {
    if(isFinite(x))
      return x;
    return 0;
  }

  function updateLink(link) {
    link.attr("x1", function(d) {
        return fixna(d.source.x);
      })
      .attr("y1", function(d) {
        return fixna(d.source.y);
      })
      .attr("x2", function(d) {
        return fixna(d.target.x);
      })
      .attr("y2", function(d) {
        return fixna(d.target.y);
      });
  }

  function updateNode(node) {
    node.attr("transform", function(d) {
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if(!d3.event.active) graphLayout.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if(!d3.event.active) graphLayout.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

}