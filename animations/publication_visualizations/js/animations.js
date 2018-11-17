function getPairs(set) {
    let pairs = [];
    for (let i = 0; i < set.length - 1; i++) {
        for (let j = i; j < set.length - 1; j++) {
            pairs.push([set[i], set[j+1]])
        }
    }
    return pairs;
}

$.ajax({
    url : "data/mypublications.bib",
    success : function(result){
        parseBibfile(result);
    }
});

var data = null;
var b = new BibtexParser();
var entry;

const dataset = {
    authors: [],
    papers: [],
    links: []
}
const authorNames = {}



function parseBibfile(x) {
    data = x;
    b.setInput(x);
    b.bibtex();

    let entryNames = Object.keys(b.entries);
    for (let i in entryNames) {
        let name = entryNames[i];
        entry = b.entries[name]

        let paperId = dataset.papers.length;
        let authors = parseAuthors(entry.AUTHOR);
        let tempAuthorList = [];
        for (let j in authors) {
            let authorId = null;
            if (!(authors[j] in authorNames)) {
                authorId = Object.keys(authorNames).length;
                authorNames[authors[j]] = {id: authorId, papers: [paperId]};
            } else {
                authorId = authorNames[authors[j]].id
                authorNames[authors[j]].papers.push(paperId);
            }
            tempAuthorList.push(authorId);
        }
        dataset.papers.push({id: paperId, title: entry.TITLE, authors: tempAuthorList})
    }

    let names = Object.keys(authorNames);
    for (let i = 0; i < names.length; i++) {
        let a = authorNames[names[i]];
        let pairs = getPairs(a.papers);
        for (let j = 0; j < pairs.length; j++) {
            dataset.links.push({source: pairs[j][0], target: pairs[j][1]})
        }
    }
    showData();
}

function parseAuthors(authorsRaw) {
    let authors = authorsRaw.split('\n')
    for (let i = 0; i < authors.length; i++) {
        let name = authors[i];
        if (name.startsWith('and ')) {
            name = name.substring(4)
        }
        const commaIdx = name.indexOf(',');
        if (commaIdx > -1) {
            const parts = name.split(', ');
            name = parts[1] + ' ' + parts[0];
        }
        authors[i] = name;
    }
    return authors;
}

var width = 600;
var height = 600;
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));

    // Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

function showData() {
    var svg = d3.select('svg');

    simulation
        .nodes(dataset.papers)
        .on("tick", tick);

    simulation.force("link")
        .links(dataset.links);

    nodes = svg.selectAll('circle')
    .data(dataset.papers)
    .enter()
    .append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', '10')
    .on("mouseover", function(d,i) {
        d3.select(this)
        .attr("fill", "orange")
        div.transition()		
                .duration(200)		
                .style("opacity", .9);		
        div.html(d.title)
        .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mouseout", function(d,i) {
        d3.select(this)
        .attr("fill", "black")
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    links = svg.selectAll('line')
    .data(dataset.links)
    .enter()
    .append('line')
    .style("stroke", "#ccc")
    .lower() // put links below nodees

    function tick() {
        links.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        nodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
    function dragsubject() {
        return simulation.find(d3.event.x, d3.event.y);
      }

    var canvas = document.querySelector("svg");
    d3.select(canvas)
      .call(d3.drag()
          .container(canvas)
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

          function dragstarted() {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
          }
          
          function dragged() {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
          }
          
          function dragended() {
            if (!d3.event.active) simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
          }
}