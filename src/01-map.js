import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


let projection = d3.geoMercator()
// define which projection you want to use
// then feed it into the geoPath
let graticule = d3.geoGraticule()
// graticules make a bunch of lines that go accross the map
// console.log(graticule())
let path = d3.geoPath().projection(projection)
// you're gonna make geographical shapes so geoPath
// you have to specifiy a projection using .projection.

var colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, 500000])

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
	let countries = topojson.feature(json, json.objects.countries)
    console.log(countries)
  svg
    .selectAll('.country')
    .data(countries.features) // always going to be .features (list inside geojson)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
  svg // adding long lat lines to map
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .lower()

  svg
    .selectAll('.cities')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', .3)
    .attr('transform', d => {
      let coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })
    .attr('fill', d => {
      return colorScale(d.population)
    })


 }