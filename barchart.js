function main() {
    var svg = d3.select("svg");
    margin = 400;
    width = svg.attr("width") - margin;
    height = svg.attr("height") - margin;
    
    var xScale = d3.scaleBand().range([0, width]).padding(0.3);
    var yScale = d3.scaleLinear().range([height, 0]);
    var g = svg.append("g").attr("transform", "translate("+margin+","+250+")");
    d3.dsv(';', 'fifa21.csv').then(function (data) {

        // Filter data for overall ratings >= 89
        var filteredData = data.filter(function (d) {
            return +d.overall >= 89;
        });

        filteredData.sort(function (a, b) {
            return +a.overall - +b.overall;
        });

        // Group data by player name and get the maximum overall rating for each player
        var players = d3.group(filteredData, d => d.name);
        var uniquePlayers = Array.from(players.keys());
        var playerRatings = uniquePlayers.map(player => {
            var playerData = players.get(player);
            var maxRating = d3.max(playerData, d => +d.overall);
            return { name: player, overall: maxRating };
        });

    // Sort data by overall rating in ascending order
    playerRatings.sort((a, b) => a.overall - b.overall);

    uniquePlayers = playerRatings.map(d => d.name);
    var overallRatings = playerRatings.map(d => d.overall);

    // Adjust yScale domain to represent overall ratings
    yScale.domain([0, d3.max(overallRatings)]);

    xScale.domain(uniquePlayers); // Use player names for x-axis labels

    svg.append("text").attr("transform", "translate(100,0)")
            .attr("x", 500).attr("y", 200)
            .attr("font-size", "24px")
            .style("font-family", "Trebuchet MS") // Set the font family here
            .text("FIFA 21 Players Bar Chart");

        // Draw the x-axis
        g.append("g").attr('transform', 'translate(0,' +height+ ')')
            .call(d3.axisBottom(xScale)).selectAll('text')
            .attr('transform','rotate(-45)') // rotates the position of the team names by 45 degrees
            .attr('text-anchor','end')
            .attr('font-size', '12px');

        // Modify the y-axis ticks to show only integer values
        g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(function (d) {
        return d;
        }).ticks(8))
        .append("text")
        .attr("x", -50)
        .attr("y", 500)
        .attr("dy", "-5em")
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .attr("fill", "navy")
        .text("Overall Rating")
        .attr('font-size', '20px');

        // Set the font size directly as a D3.js attribute
        g.selectAll('.bar-label')
        .data(overallRatings)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', function(_, i) {
            return xScale(uniquePlayers[i]) + xScale.bandwidth() / 10;
        })
        .attr('y', function(d) {
            return yScale(d) - 20; // Move the text slightly above the bars
        })
        .attr('font-size', '20px') // Adjust the font size as desired
        .text(function(d) {
            return d;
        });

        g.append("line")
            .attr("x1", -100) // X-coordinate of the bar's left side
            .attr("y1", -100) // Y-coordinate of the bar's center
            .attr("x2", -10) // X-coordinate of the annotation text
            .attr("y2", -10) // Y-coordinate of the annotation text
            .attr("stroke", "black");

        g.append("text")
            .attr("x", -320)
            .attr("y", -110)
            .text("The players' overall ratings are arranged in ascending order from left to right.")
            .attr("text-anchor", "start") // Align the text to the start (left) of the text position
            .attr("dy", "0.32em");


        // Create and draw the stacked bars
        g.selectAll(".bar")
            .data(filteredData)
            .enter().append("rect")
            .attr("class", "bar")
            // .on("mouseover", onMouseOver) // adding in a listener for the event
            // .on("mouseout", onMouseOut) // this is the same thing
            .on("mouseover", function(event, d) {
                // Get bar's xy values, then augment for the tooltip
            var xPosition = parseFloat(d3.select(this).attr('x')) + xScale.bandwidth() / 2; // the tooltip should be at the center of the bar
            var yPosition = (parseFloat(d3.select(this).attr('y')) / 2) + height;

            // Update tooltip's position and value
            d3.select('#tooltip')
            .style('left', xPosition + 'px')
            .style('top', yPosition + 'px')
            .select('#value')
            .html("Nationality: " + d.nationality + "<br>Position: " + d.position + "<br>Age: " + d.age + "<br>Team: " + d.team);

            d3.select('#tooltip').classed('hidden', false);

            d3.select(this).attr('class','highlight')
            d3.select(this)
            .transition() // adding an animation here
            .duration(500) // again, it is 500 miliseconds
            .attr('width', xScale.bandwidth() + 5) // everytime a bar is hovered over, it sort of changes size
            .attr('y', function(d) { return yScale(d.overall) - 10})
            .attr('height', function(d) { return height - yScale(d.overall) + 10;});
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr('class', 'bar')
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('width', xScale.bandwidth())
                    .attr('y', function(d) { return yScale(d.overall); })
                    .attr('height', function(d) { return height - yScale(d.overall); });

                d3.select('#tooltip').classed('hidden', true);
            })
            .attr("x", function(d, i) { return xScale((uniquePlayers[i])); })
            .attr("y", function(d) { return yScale(d.overall); })
            .attr("width", xScale.bandwidth())
            .transition()
            .ease(d3.easeLinear)
            .duration(500) // 500 miliseconds
            .delay(function(d, i) { return i * 50; })
            .attr("height", function(d) { return height - yScale(d.overall); })
    });
}
