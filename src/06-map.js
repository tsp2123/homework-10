import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')




let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let radiusScale = d3
  .scaleSqrt()
  .domain([0, 50])
  .range([0, 1])

var yPositionScale = d3.scaleBand().range([100, 400])


let colorScale = d3
  .scaleOrdinal()
  .domain([
    'hydroelectric',
    'coal',
    'natural gas',
    'nuclear',
    'petroleum',
    'pumped storage',
    'geothermal',
    'biomass',
    'wind',
    'other',
    'solar'
  ])
  .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])

  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, powerplants]) {
  // console.log(json)
  let states = topojson.feature(json, json.objects.us_states)
  // console.log(states)

  var states_list = powerplants.map(d => d.states)
  projection.fitSize([width, height], states)

  // nested data

  var nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(powerplants)
 container
    .selectAll('source-graphs')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)
      var powerplants = d.values

      projection.fitSize([width, height], states)

      svg
        .selectAll('.states')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', 'lightgrey')
        .attr('stroke', 'none')

      svg
        .selectAll('.powerplants')
        .data(powerplants)
        .enter()
        .append('circle')
        .attr('class', 'powerplant')
        .attr('r', d => radiusScale(d.Total_MW))
        .attr('fill', d => colorScale(d.PrimSource))
        .attr('opacity', 0.5)
        .attr('transform', d => {
          // console.log(d)
          var coords = [d.Longitude, d.Latitude]
          // console.log(coords)
          return `translate(${projection(coords)})`  
        })

      //labels

      svg
        .append('text')
        .text(d.key)
        .attr('font-weight', '400')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
    })



}