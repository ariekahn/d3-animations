var fullWidth = 1000,
    fullHeight = 800;

var width = 600,
    height = 600
// maxRadius = 20;

var yearDims = {width: 500, height: 200};
var yearMargin = {top: 20, right: 20, bottom: 30, left: 120};

var authorDims = {width: 200, height: 600};
var authorMargin = {top: 20, right: 20, bottom: 30, left: 120};

const zoom = d3.zoom()
.scaleExtent([1/4, 9])
// .translate(width / 2, height/2)
.on('zoom', function () {
    d3.select('g').attr('transform', d3.event.transform)
});

var svg = d3.select("#graph").append("svg")
.attr("width", fullWidth)
.attr("height", fullHeight)
.attr('transform', 'translate(' + width/2 + ',' + height / 2 + ')')
// .call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(0.5))
.call(zoom)

var g = svg
.append('g')
.attr('transform', 'translate(0,100)')

var barchart = svg
.append('g')
.attr('transform', 'translate(0,0)')

var authorchart = svg
.append('g')
.attr('transform', 'translate(700, 0)');

// var barchart = d3.select("#barchart").append("svg")
// .attr("width", 400)
// .attr("height", height)
// .append("g")

function parseAuthors(authorsRaw) {
    let authors = authorsRaw.split(' and ');
    return authors;
}

var div = d3.select("body").append("div")	
.attr("class", "tooltip")				
.style("opacity", 0);

n = 100;
var d;
d3.json('data/dsb_citations_full.json')
.then( (dataset) => {
    
    // Get rid of some garbage data
    dataset = dataset.filter(x => x.bib.year >= 2006)
    dataset = dataset.filter(x => x.bib.author)

    // Parse authors
    dataset.forEach(item => {
        item.authors = parseAuthors(item.bib.author);
    })
    
    // Make it globally available for debug
    d = dataset;
    
    let years = d.map(x => x.bib.year).filter(Boolean)
    // get unique years
    years = Array.from(new Set(years)).sort()
    const maxYear = Math.max(...years) 
    const minYear = Math.min(...years)
    m = maxYear - minYear; // number of clusters
    years.unshift('All');
    
    const clusters = new Array(m);
    
    const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(m));
    
    // var yearToCluster = {};

    function sizeBy(f) {
        dataset.forEach(item => item.radius = f(item));
    }

    function groupBy(f) {
        dataset.forEach(item => item.cluster = f(item));
        for (let i = 0; i < dataset.length; i++) {
            cluster = dataset[i].cluster;
            if (!clusters[cluster] || (dataset[i].radius > clusters[cluster].radius)) clusters[cluster] = dataset[i];
        }
    }

    function updateSize() {
        nodes
        .transition()
        .attr('r', d => d.radius);
    }
    
    function updateColor() {
        nodes
        .transition()
        .style("fill", d => color(d.cluster))
    }

    sizeBy(x => Math.max(1, x.citedby/20));
    groupBy(x => x.bib.year - minYear);

    // Set x and y
    for (let i = 0; i < dataset.length; i++) {
        dataset[i].x = width/2;
        dataset[i].y = height/2;
        dataset[i].opacity = 1;
        if (isNaN(dataset[i].radius)) {
            dataset[i].radius = 1
        }
    }


    
    var forceCollide = d3.forceCollide(10)
    .radius( d => d.radius + 1.5)
    .iterations(1);
    
    var simulation = d3.forceSimulation()
    // .alpha(2)
    // .alphaDecay(0.1)
    .force("center", d3.forceCenter(width/3, height/2))
    .force("collide", forceCollide)
    .force("cluster", forceCluster)
    .force("gravity", d3.forceManyBody(1))
    .force("x", d3.forceX().strength(.7))
    .force("y", d3.forceY().strength(.7))
    .nodes(dataset)
    .on("tick", tick);
    
    let nodes = g.selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('r', d => d.radius)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr("opacity", d => d.opacity)
    .style("stroke", "black")
    .style("fill", d => color(d.cluster))
    .on("mouseover", function(d,i) {
        d3.select(this)
        .style("stroke", "red")
        
        div.transition()		
        .style("opacity", .9);	
        
        div.html(''  + d.bib.title + '<br/><b>citations: ' + d.citedby + '<br/>year: ' + d.bib.year + '</b>')
        .style("left", d.x + 2*d.radius + "px")
        .style("top", d.y + "px")
    })
    .on("mouseout", function(d,i) {
        d3.select(this)
        .style("stroke", "black")

        div.transition()		
        .duration(500)		
        .style("opacity", 0);	
    })
    .on("click", (d,i) => {
        selectYear(d.bib.year)
    })
    
    function tick() {
        nodes
        // .attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; });
        .attr("cx", function(d) { return d.x = Math.max(d.radius, Math.min(width - 200 - d.radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(d.radius, Math.min(height - 200 - d.radius, d.y)); });
    }
    
    function forceCluster(alpha) {
        for (var i = 0, n = dataset.length, node, cluster, k = alpha * 1; i < n; ++i) {
            node = dataset[i];
            cluster = clusters[node.cluster];
            node.vx -= (node.x - cluster.x) * k;
            node.vy -= (node.y - cluster.y) * k;
        }
    }
    
    
    function selectYear(year) {
        for (let i = 0; i < dataset.length; i++) {
            if (year === 'All' || dataset[i].bib.year === year) {
                dataset[i].opacity = 1.0;
            } else {
                dataset[i].opacity = 0.2;
            }
        }
        for (let i = 0; i < bins.length; i++) {
            if (year === 'All' || bins[i].x0 === year) {
                bins[i].opacity = 1.0;
            } else {
                bins[i].opacity = 0.2;
            }
        }
        
        nodes.transition()
        .attr("opacity", d => d.opacity)
        
        bars.transition()
        .attr("opacity", d => d.opacity)

        showAllAuthors(year)
    }
    
    var yearButtons = d3.select(".categoricalButtons")
    .selectAll("button")
    .data(years)
    .enter().append("button")
    .text(function(d) { return d; })
    .on("click", function(buttonValue) {
        selectYear(buttonValue);
    });
    
    nodes.call(d3.drag().on("start", started));
    function started() {
        if (!d3.event.active) simulation.alphaTarget(0.01).restart();
        var circle = d3.select(this).classed("dragging", true);
        
        d3.event.on("drag", dragged).on("end", ended);
        
        function dragged(d) {
            circle.raise().attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }
        
        function ended() {
            circle.classed("dragging", false);
            if (!d3.event.active) simulation.alphaTarget(0);
        }
    }
    
    // Publishers
    // var publishers = dataset.map(x => x.bib.publisher).filter(Boolean);
    // publishers = Array.from(new Set(publishers)).sort();
    // publishers.unshift('All');
    // publishers = publishers.map(x => x.toLowerCase());
    
    // var publisherButtons = d3.select(".publisherButtons")
    // .selectAll("button")
    // .data(publishers)
    // .enter().append("button")
    // .text(function(d) { return d; })
    // .on("click", function(buttonValue) {
    //     selectPublisher(buttonValue);
    // });
    
    // function selectPublisher(publisher) {
    //     for (let i = 0; i < dataset.length; i++) {
    //         if (publisher === 'all' || (dataset[i].bib.publisher && dataset[i].bib.publisher.toLowerCase() === publisher)) {
    //             dataset[i].opacity = 1.0;
    //         } else {
    //             dataset[i].opacity = 0.2;
    //         }
    //     }
        
    //     nodes.transition()
    //     .attr("opacity", d => d.opacity)
    // }
    
    
    //https://beta.observablehq.com/@mbostock/d3-histogram
    var barchartDims = ({width: 500, height: 200})
    var margin = ({top: 20, right: 20, bottom: 30, left: 120});
    
    x = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d.bib.year)).nice()
    .range([margin.left, barchartDims.width - margin.right])
    
    var bins = d3.histogram()
    .value(d => d.bib.year)
    .domain(x.domain())
    .thresholds(x.ticks(x.domain()[1] - x.domain()[0]))
    (dataset)
    
    y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([0, d3.max(bins, d => d.length)])
    
    
    
    bars = barchart
    .attr("fill", "steelblue")
    .selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr("fill", d => color(d.x0 - minYear))
    .attr("x", d=> margin.left + (d.x0-minYear)*((barchartDims.width-margin.left-margin.right-8)/(maxYear-minYear)))
    .attr("y", 25)
    .attr("width", 15)
    .attr("opacity", d => d.opacity)
    .attr("height", d => d.length)
    .on("click", (d,i) => {
        selectYear(d.x0);
    })
    .on("mouseover", function(d,i) {
        d3.select(this)
        .style("stroke", "red");
        
        div.transition()		
        .style("opacity", .9);		
        div.html('Year: '  + d.x0 + '<br/>Publications: ' + d.length)
        .style("left", (d.x0-2000)*20 + 400 + "px")
        .style("top", 50 + "px")
        // .style("left", (d3.event.pageX) + "px")		
        // .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mouseout", function(d,i) {
        d3.select(this)
        .style("stroke", "black");
        
        div.transition()		
        .duration(500)		
        .style("opacity", 0);	
    });
    
    // var axis = d3.axisLeft(y).ticks(20);
    // yAxis = barchart.call(axis)
    
    xAxis = barchart
    .call(d3.axisBottom(x))

    yAxis = barchart
    .append('g')
    .attr("transform", `translate(${barchartDims.width},${margin.top + 5})`)
    .call(d3.axisRight(y))
    // .call(barchart => barchart.select(".domain").remove())
    // .attr("transform", `translate(0,${height - margin.bottom})`)
    // .call(d3.axisBottom(x).tickSizeOuter(0))
    // .call(svg => svg.append("text")
    //     .attr("x", width - margin.right)
    //     .attr("y", -4)
    //     .attr("fill", "#000")
    //     .attr("font-weight", "bold")
    //     .attr("text-anchor", "end")
    //     .text(bins.x))
    
    // yAxis = svg
    // // .attr("transform", `translate(${margin.left},0)`)
    // .call(d3.axisLeft(y))
    // // .call(svg => svg.select(".domain").remove())
    // // .call(svg => svg.select(".tick:last-of-type text").clone()
    //     .attr("x", 4)
    //     .attr("text-anchor", "start")
    //     .attr("font-weight", "bold")
    //     .text(bins.y0   )


    let authorYAxis = authorchart
    .append('g')
    // .attr('transform', 'translate(500,0)')

    function showAllAuthors(year) {
        authorList = [];
        for (let i = 0; i < dataset.length; i++) {
            for (let j = 0; j < dataset[i].authors.length; j++) {
                if (year == 'All' || dataset[i].bib.year == year) {
                    authorList.push({year: dataset[i].bib.year, author: dataset[i].authors[j]});
                }
            }
        }

        authors = d3.nest().key(x => x.author).entries(authorList);
        authors = authors.sort((x,y) => y.values.length - x.values.length);

        let authorY = d3.scaleBand()
        .domain(authors.map(x => x.key))
        .range([0, authors.length*20])
        
        
        // authorBins = d3.histogram()
        // .value(d => d.values.year)
        // .domain(authorY.domain())
        // .thresholds(authorY.ticks(authorY.domain()[1] - authorY.domain()[0]))
        // (authors)

        var a = authorchart.selectAll('rect')
        .data(authors);

        a
        .enter()
        .append('rect')
        .attr('width', d => d.values.length+10)
        .attr('height', 15)
        .attr('x', 0)
        .attr('y', d=>authorY(d.key))
        .attr('fill','blue')
        .merge(a)
        .attr('width', d => d.values.length+10)

        a.exit().remove();

        let yAxis = authorYAxis
        .call(d3.axisLeft(authorY))

        // authorchart
        // .selectAll('text')
        // .data(authors)
        // .enter()
        // .attr('x', d=>500-(d.values.length+10))
        // .attr('y', d=>authorY(d.key)*20)
    }
    showAllAuthors('All')

    // var authorBins = d3.histogram()
    // .value(d => d.author)
    // .domain(x.domain())
    // .thresholds(x.ticks(x.domain()[1] - x.domain()[0]))
    // (dataset)
    
});