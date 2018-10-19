import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let colorScale = d3.scaleSequential(d3.interpolatePiYG).domain([0, 1])
let opacityScale = d3
  .scaleLinear()
  .domain([0, 80000])
  .range([0, 1])
  .clamp(true)
let projection = d3.geoAlbersUsa()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))
function ready(json) {
  console.log(json.objects)
  let counties = topojson.feature(json, json.objects.us_counties)

  projection.fitSize([width, height], counties)

  svg
    .selectAll('.county')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', 'white')
    .attr('stroke', 'none')
    .attr('class', d => d.properties.state)
    .attr('fill', d => {
      // console.log(d.properties)
      if (!d.properties.state) {
        return 'white'
      } else {
        var percent_trump =
          d.properties.trump / (d.properties.trump + d.properties.clinton)
        return colorScale(percent_trump)
      }
    })
    .attr('opacity', function(d) {
      if (d.properties.state) {
        let totalVotes = d.properties.clinton + d.properties.trump
        return opacityScale(totalVotes)
      }
    })
}
