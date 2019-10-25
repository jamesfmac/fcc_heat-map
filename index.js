// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 30, left: 60 },
  width = 1200,
  height = 625;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const title = "Title";
const desc = "Desc";

// append the svg object to the body of the page
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("title", title)
  .attr("description", desc)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3
  .select("#chart")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

function getOffset(el) {
  const rect = el.getBoundingClientRect();

  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

const drawChart = data => {
  // Setting up the data for lables

  const baseTemperature = 8.66;
  const years = data.map(x => x.year);
  const months = data.map(x => x.month);
  const distinctMonths = [...new Set(months)].reverse();

  const variance = data.map(x => x.variance);

  const getTemp = variance => {
    return (Math.round((variance + baseTemperature) * 10) / 10).toFixed(1);
  };

  // creating temp data
  const temps = data.map(x => {
    return x.variance + baseTemperature;
  });

  // Build X scales and axis:
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(years);

  svg
    .append("g")
    .attr("transform", "translate(0," + (height - 100) + ")")
    .attr("id", "x-axis")
    .call(
      d3
        .axisBottom(x)
        .tickValues(x.domain().filter(year => year.toString().slice(-1) == "0"))
    );

  // Build Y scales and axis:
  var y = d3
    .scaleBand()
    .range([height - 100, 0])
    .domain(distinctMonths)
    .padding(0.01);

  svg
    .append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(y).tickFormat(x => monthNames[x - 1]));

  // Build color scale
  var myColor = d3
    .scaleLinear()
    .range(["blue", "red"])
    .domain([d3.min(temps), d3.max(temps)]);

  //create Rect

  svg
    .append('g')
    .selectAll('rect')
    .data(data, function(d) {
      return d.year + ":" + d.month;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.year);
    })
    .attr("y", function(d) {
      return y(d.month);
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("data-year", d => d.year)
    .attr("data-month", d => d.month - 1)
    .attr("data-temp", d => getTemp(d.variance))
    .attr("class", "cell")
    .style("fill", function(d) {
      return myColor(getTemp(d.variance));
    })

    //adding tooltips

    .on("mouseover", function(d, i) {
      tooltip
        .transition()
        .duration(0)
        .style("left", event.clientX - 40 + "px")
        .style("top", event.clientY - 60 + "px")
        .attr("data-year", d.year)
        .style("opacity", 1);

      tooltip.html(
        `${monthNames[d.month - 1]} ${d.year}<br/> ${getTemp(
          d.variance
        )}<br/> ${d.variance}`
      );
    })
    .on("mouseout", function(el) {
      tooltip.transition().style("opacity", 0);
    });

  // adding legend

  var formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

  const threshold = d3.scaleThreshold()
    .domain([0.11, 0.22, 0.33, 0.50])
    .range(["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000"]);

const xLegend = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 240]);

const xAxis = d3.axisBottom(xLegend)
    .tickSize(30)
    .tickValues(threshold.domain())
    .tickFormat(function(d) { return d === 0.5 ? formatPercent(d) : formatNumber(100 * d); });

  const legend = 
  svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0," + (height - 50) + ")")
    .call(xAxis)

legend
    .selectAll(".tick text")
    .style("text-anchor", "middle")

legend.selectAll('.domain')
.remove()



legend
    .selectAll('rect', '.tick')
    .data(threshold.range().map (color =>{
        var d = threshold.invertExtent(color);
    if (d[0] == null) d[0] = xLegend.domain()[0];
    if (d[1] == null) d[1] = xLegend.domain()[1];
    return d
    }))
    .enter()
    .append("rect")
    .attr("height", 25)
    .attr("x", function(d) { return xLegend(d[0]); })
    
    .attr("width", function(d) { return xLegend(d[1]) - xLegend(d[0]); })
    .attr("fill", function(d) { return threshold(d[0]); })
};

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then(function(response) {
    return response.json();
  })
  .then(json => {
    drawChart(json.monthlyVariance);
  })
  .catch(eror => {
    console.log(eror);
  });
