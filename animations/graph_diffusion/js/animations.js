const MIN_OPACITY = 0.1
const MIN_WIDTH = 1
const DECAY_RATE = 0.9;

const dataset = {
    // Modular graph definition
    nodes: [
        { id: 0, color: '#ccc', fx: 270, fy: 200, energy: 0, opacity: MIN_OPACITY },
        { id: 1, color: '#ccc', fx: 250, fy: 260, energy: 0, opacity: MIN_OPACITY },
        { id: 2, color: '#ccc', fx: 300, fy: 300, energy: 0, opacity: MIN_OPACITY },
        { id: 3, color: '#ccc', fx: 350, fy: 260, energy: 0, opacity: MIN_OPACITY },
        { id: 4, color: '#ccc', fx: 330, fy: 200, energy: 0, opacity: MIN_OPACITY },
        { id: 5, color: '#ccc', fx: 390, fy: 160, energy: 0, opacity: MIN_OPACITY },
        { id: 6, color: '#ccc', fx: 440, fy: 125, energy: 0, opacity: MIN_OPACITY },
        { id: 7, color: '#ccc', fx: 420, fy: 60, energy: 0, opacity: MIN_OPACITY },
        { id: 8, color: '#ccc', fx: 370, fy: 60, energy: 0, opacity: MIN_OPACITY },
        { id: 9, color: '#ccc', fx: 340, fy: 125, energy: 0, opacity: MIN_OPACITY },
        { id: 10, color: '#ccc', fx: 260, fy: 125, energy: 0, opacity: MIN_OPACITY },
        { id: 11, color: '#ccc', fx: 230, fy: 60, energy: 0, opacity: MIN_OPACITY },
        { id: 12, color: '#ccc', fx: 180, fy: 60, energy: 0, opacity: MIN_OPACITY },
        { id: 13, color: '#ccc', fx: 160, fy: 125, energy: 0, opacity: MIN_OPACITY },
        { id: 14, color: '#ccc', fx: 210, fy: 160, energy: 0, opacity: MIN_OPACITY },
    ],

    links: [
        { source: 0, target: 1, width: 1, color: '#ccc'},
        { source: 0, target: 2, width: 1, color: '#ccc'},
        { source: 0, target: 3, width: 1, color: '#ccc'},
        { source: 1, target: 2, width: 1, color: '#ccc'},
        { source: 1, target: 3, width: 1, color: '#ccc'},
        { source: 1, target: 4, width: 1, color: '#ccc'},
        { source: 2, target: 3, width: 1, color: '#ccc'},
        { source: 2, target: 4, width: 1, color: '#ccc'},
        { source: 3, target: 4, width: 1, color: '#ccc'},
        { source: 4, target: 5, width: 1, color: '#ccc'},

        { source: 5, target: 6, width: 1, color: '#ccc'},
        { source: 5, target: 7, width: 1, color: '#ccc'},
        { source: 5, target: 8, width: 1, color: '#ccc'},
        { source: 6, target: 7, width: 1, color: '#ccc'},
        { source: 6, target: 8, width: 1, color: '#ccc'},
        { source: 6, target: 9, width: 1, color: '#ccc'},
        { source: 7, target: 8, width: 1, color: '#ccc'},
        { source: 7, target: 9, width: 1, color: '#ccc'},
        { source: 8, target: 9, width: 1, color: '#ccc'},
        { source: 9, target: 10, width: 1, color: '#ccc'},

        { source: 10, target: 11, width: 1, color: '#ccc'},
        { source: 10, target: 12, width: 1, color: '#ccc'},
        { source: 10, target: 13, width: 1, color: '#ccc'},
        { source: 11, target: 12, width: 1, color: '#ccc'},
        { source: 11, target: 13, width: 1, color: '#ccc'},
        { source: 11, target: 14, width: 1, color: '#ccc'},
        { source: 12, target: 13, width: 1, color: '#ccc'},
        { source: 12, target: 14, width: 1, color: '#ccc'},
        { source: 13, target: 14, width: 1, color: '#ccc'},
        { source: 14, target: 0, width: 1, color: '#ccc'},
    ]
}

let energy = math.zeros(15);
let connectivity = math.zeros(15,15);

for (let i = 0; i < dataset.links.length; i++) {
    let link = dataset.links[i];
    connectivity.subset(math.index(link.source, link.target), 0.2);
    connectivity.subset(math.index(link.target, link.source), 0.2);
    // connectivity.subset(math.index())
}

/////////////////
// Scrolling code
/////////////////
// Reference to where we print this out in text
let currentScrollTop = d3.select('#currentScrollTop');

// Previous and new scroll locations
let scrollTop = 0;
let newScrollTop = 0;

const container = d3.select('#container');

// Whenever we scroll in container,
// update our position and try to redraw
container.on("scroll.scroller", () => {
    newScrollTop = container.node().scrollTop;
    window.requestAnimationFrame(render);
});

// Returns the fraction of the container scrolled
function getScrollFraction() {
    const node = container.node();
    const visibleHeight = node.getBoundingClientRect().height;
    const scrollTop = node.scrollTop;
    const height = node.scrollHeight;

    return scrollTop / (height - visibleHeight);
}

// Where in the graph we currently are
let currentNode = 1;
let prevNode = 1;

function render() {
    // If we've scrolled since last rendering
    if (scrollTop != newScrollTop) {
        scrollTop = newScrollTop

        // Update text
        currentScrollTop.text(getScrollFraction());

        var loc = Math.floor(getScrollFraction() * 15);
        loc = Math.max(0, Math.min(loc, 14));
        // If our node has changeed
        if (currentNode != loc) {
            prevNode = currentNode;
            currentNode = loc;
            dataset.nodes[prevNode].color = 'black';
            dataset.nodes[prevNode].opacity = 1.0;
            // dataset.nodes[currentNode].colo= 'green';
            // dataset.nodes[currentNode].opacity = 0.5;

            for (var i = 0; i < dataset.links.length; i++) {
                edge = dataset.links[i];
                if ((edge.source.id == currentNode && edge.target.id == prevNode) ||
                    (edge.target.id == currentNode && edge.source.id == prevNode)) {
                    // dataset.links[i].color = 'red';
                    dataset.links[i].width = 10;
                } else {
                    // dataset.links[i].color = '#ccc';
                    // dataset.links[i].width = 1;
                }
            }
            ticked()
        }
    }
}

function forceSimulation(nodes, links) {
    return d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter())
};

var svg = d3.select('svg');

var link = svg.selectAll("line")
    .data(dataset.links)
    .enter()
    .append("line")
    .attr("id", function (d, i) { return 'edge' + i })
    .attr('marker-end', 'url(#arrowhead)')
    .style("stroke", "#ccc")
    .style("pointer-events", "none");

var d = 0;
var i = 0;
var node = svg.selectAll("circle")
    .data(dataset.nodes)
    .enter()
    .append("circle")
    .attr("r", 15)
    // .style("fill", d => d.color)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .on('click', (d, i) => {
        // console.log(d3.select(i));
        energy.subset(math.index(d.id), 1);
        updateNodeEnergy();
    });

const simulation = forceSimulation(dataset.nodes, dataset.links)
simulation.on("tick", ticked);

function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .style("stroke-width", d => d.width)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .style("stroke", d => d.color)

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        // .style("fill", d => d.color)
        .style("fill", function(d) { return colorScale(d.energy); });
    // .style("opacity", d => d.opacity)
}

var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
var colorScale = d3.scaleQuantile()
              .domain([0, 1])
              .range(colors);

function graphTick() {
    // if (math.sum(energy) > 0) {
        energy = math.multiply(connectivity, energy);
    // }
    updateNodeEnergy();
}

function updateNodeEnergy() {
    for (let i = 0; i < dataset.nodes.length; i++) {
        dataset.nodes[i].energy = energy.subset(math.index(i));
    }
    simulation.restart()
    
}

updateNodeEnergy();
window.setInterval(graphTick, 5000);

// function fadeNodes() {
//     for (let i = 0; i < dataset.nodes.length; i++) {
//         dataset.nodes[i].opacity = Math.max(MIN_OPACITY, dataset.nodes[i].opacity - 0.05);
//         ticked();
//     }
//     for (let i = 0; i < dataset.links.length; i++) {
//         dataset.links[i].width = Math.max(MIN_WIDTH,  dataset.links[i].width - 1);
//         // dataset.nodes[i].opacity = 0.1;
//         ticked();
//     }
// }

// var fadeTimer = window.setInterval(fadeNodes, 1000);
