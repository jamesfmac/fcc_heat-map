// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 30, left: 60 },
  width = 1200,
  height = 600;

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
    .attr("transform", "translate(0," + height + ")")
    .attr("id", "x-axis")
    .call(
      d3
        .axisBottom(x)
        .tickValues(x.domain().filter(year => year.toString().slice(-1) == "0"))
    );

  // Build Y scales and axis:
  var y = d3
    .scaleBand()
    .range([height, 0])
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



    // Example Legend 








    //// End Legend









  //add tooltips

  svg
    .selectAll()
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
