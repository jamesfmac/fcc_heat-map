// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 30, left: 60 },
  width = 1200,
  height = 625;

var colorbrewer = {
  RdYlBu: {
    3: ["#fc8d59", "#ffffbf", "#91bfdb"],
    4: ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
    5: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    6: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
    7: [
      "#d73027",
      "#fc8d59",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#91bfdb",
      "#4575b4"
    ],
    8: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4"
    ],
    9: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4"
    ],
    10: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4",
      "#313695"
    ],
    11: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4",
      "#313695"
    ]
  },
  RdBu: {
    3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
    4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
    5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
    6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    7: [
      "#b2182b",
      "#ef8a62",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#67a9cf",
      "#2166ac"
    ],
    8: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac"
    ],
    9: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac"
    ],
    10: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac",
      "#053061"
    ],
    11: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac",
      "#053061"
    ]
  }
};

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

  var legendColors = colorbrewer.RdYlBu[11].reverse();
  var legendWidth = 400;

  const variance = data.map(x => x.variance);

  const getTemp = variance => {
    return (Math.round((variance + baseTemperature) * 10) / 10).toFixed(1);
  };

  var minTemp = baseTemperature + Math.min.apply(null, variance);
  var maxTemp = baseTemperature + Math.max.apply(null, variance);

  var legendThreshold = d3
    .scaleThreshold()
    .domain(
      (function(min, max, count) {
        var array = [];
        var step = (max - min) / count;
        var base = min;
        for (var i = 1; i < count; i++) {
          array.push(base + i * step);
        }
        return array;
      })(minTemp, maxTemp, legendColors.length)
    )
    .range(legendColors);

  // creating temp data
  const temps = data.map(x => {
    return x.variance + baseTemperature;
  });

  // Build X scales and axis:
  var x = d3
    .scaleBand()
    .range([0, (width)])
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
  const y = d3
    .scaleBand()
    .range([height - 100, 0])
   
    .domain(distinctMonths)
    .padding(0.01);


  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(-1,0)")
    .call(d3.axisLeft(y).tickFormat(x => monthNames[x - 1]));
    

  // Build color scale
  var myColor = d3
    .scaleLinear()
    .range(["blue", "red"])
    .domain([d3.min(temps), d3.max(temps)]);

  //create Rect

  svg
    .append("g")
    .selectAll("rect")
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
    .style("fill", function(d, i) {
      return legendThreshold(baseTemperature + d.variance);
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

  var legendX = d3
    .scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, legendWidth]);

  var legendXAxis = d3
    .axisBottom(legendX)
    .tickSize(30)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format(".1f"));

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0," + (height - 50) + ")")
    .call(legendXAxis);

  legend.selectAll(".tick text").style("text-anchor", "middle");

  legend.selectAll(".domain").remove();

  legend
    .append("g")
    .selectAll("rect")
    .data(
      legendThreshold.range().map(function(color) {
        var d = legendThreshold.invertExtent(color);
        if (d[0] == null) d[0] = legendX.domain()[0];
        if (d[1] == null) d[1] = legendX.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect", ".tick")
    .style("fill", function(d, i) {
      return legendThreshold(d[0]);
    })
    .attr("x", function(d, i) {
      return legendX(d[0]);
    })
    .attr("y", 0)
    .attr("width", function(d, i) {
      return legendX(d[1]) - legendX(d[0]);
    })
    .attr("height", 30);

  
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
