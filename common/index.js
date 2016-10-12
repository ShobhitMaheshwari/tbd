var display = function (projection_data){

    var width = 960,
        height = 550;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

    // Append Div for tooltip to SVG
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    var getColor = function(population_data){
        //split regions into 6 parts logarithmically based in the population
        var population = [];
        for (var name in population_data)
            population.push(population_data[name]/1000000);
        population.sort();
        population.reverse();
        var boundaries = [];
        for(var i = 0; i < Math.log(population.length); i+=Math.log(population.length)/6){
            boundaries.push(population[Math.floor(Math.pow(2.1782817828, i))]);
        }
        boundaries.shift();
        boundaries.reverse();
        return d3.scaleThreshold()
                .domain(boundaries.map(function(x){return x*1000000;}))
                .range(["#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
        
    };

    d3.json("region.json", function(error, data) {
        if (error) return console.error(error);

        var subunits = topojson.feature(data, data.objects.countries);

        var projection = d3.geoAlbers()
            .center(projection_data.center)
            .rotate(projection_data.rotate)
            .parallels(projection_data.parallels)
            .scale(projection_data.scale)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);

        d3.json("population.json", function(error, population) {
            var max = Number.MIN_VALUE, min = Number.MAX_VALUE;
            for (var key in population){
                if (max < population[key])
                    max = population[key];
                if (min > population[key])
                    min = population[key];
            }

            //var color = getColor(population);
            var color = d3.scaleThreshold()
                .domain([10, 40, 60, 70, 110].map(function(x){return x*1000000;}))
                .range(["#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

            var formatNumber = d3.format(".2s");

            svg.selectAll(".subunit")
                .data(topojson.feature(data, data.objects.countries).features)
                .enter().append("path")
                .style("fill", function(d){
                    if(d.properties.name)
                        return color(population[d.properties.name]);
                })
                .attr("class", function(d) {
                    if(d.properties.countryname)
                        return "subunit background";
                    else
                        return "subunit";
                })
                .attr("d", path)
                .on("mouseover", function(d) {
                    if(d.properties.name){
                        d3.select(this).attr("class", "highlight");

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        div.append("div").text(d.properties.name);
                        div.append("div").text(formatNumber(population[d.properties.name]));
                    }
                })
                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlight", false);
                    div.selectAll("*").remove();
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });

            // A position encoding for the key only.
//            var arr = [];
//            for (var name in population)
//                arr.push(population[name]);
        
            var x = d3.scaleLog()
                .domain([9000000, 120000000])
//                .domain([d3.min(arr), d3.max(arr)])
                .range([0, 480]);

            var xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues(color.domain())
                .tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });

            var g = svg.append("g")
                .attr("transform", "translate(460,40)");

            g.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                        z: d
                    };
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });

            g.call(xAxis).append("text")
                .attr("class", "caption")
                .attr("y", -6)
                .attr("fill", "#000")
                .text("Total population");
        });

    });
};
