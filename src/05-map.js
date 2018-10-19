import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

//set projects
let projection = d3.geoAlbersUsa()


let path = d3.geoPath().projection(projection)

//make radius and color scale

let radiusScale = d3
  .scaleSqrt()
  .domain([0, 60])
  .range([0, 2])
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

  // add map

  svg
    .selectAll('.states')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'lightgrey')

  // add powerplant 

  svg
    .selectAll('.powerplants')
    .data(powerplants)
    .enter()
    .append('circle')
    .attr('class', 'powerplant')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', 0.6)
    .attr('transform', d => {
      // console.log(d)
      var coords = [d.Longitude, d.Latitude]
      // console.log(coords)
      return `translate(${projection(coords)})` // this is how you convert lat/long to pixels
    })



  svg
    .selectAll('.state-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .text(d => d.properties.abbrev)
    .attr('transform', d => {
      let coords = projection(d3.geoCentroid(d))
      return `translate(${coords})`
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 10)
   	.append('text')
    .text(d.key.charAt(0).toUpperCase() + d.key.slice(1))
    .attr('dx', 10)
    .attr('fill', 'black')
    .attr('alignment-baseline', 'middle')



}