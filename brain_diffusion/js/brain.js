let svg = d3.select('svg');

var lineFunction = d3.line()
                    .x( d => d[0] )
                    .y( d => 400-d[1] )
                    .curve(d3.curveBasis)

var fadeTimer;
d3.json("data/tracks_yz.json")
.then((tracks) => {
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].visibility = 'hidden';
    }
    var lines = svg.selectAll("path")
    .data(tracks)
    .enter()
    .append("path")
    .attr("d", d => lineFunction(d.data))
    .attr("stroke-width", 1)
    .attr("stroke", "blue")
    .attr("opacity", 0.2)
    .attr("visibility", d => d.visibility)

    var n = 0;
    
    function addEdges() {
        tracks[n].visibility = 'visible';
        lines.attr("visibility", d => d.visibility);
        n += 1;
        if (n >= tracks.length) {
            window.clearInterval(fadeTimer);
        }
    }
    fadeTimer = window.setInterval(addEdges, 10);
})




