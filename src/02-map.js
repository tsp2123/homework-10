import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 400 - margin.top - margin.bottom

let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

let nyc = [-74, 40]

let projection = d3.geoEqualEarth()

let path = d3.geoPath().projection(projection)

let coordinateStore = d3.map()

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  let countries = topojson.feature(json, json.objects.countries)

  datapoints.forEach(d => {
    let name = d.iata_code
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  projection.fitSize([width, height], countries)

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#D3D3D3')
    .attr('stroke', 'black')

  svg
    .selectAll('.airports')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'airports')
    .attr('r', 2)
    .attr('transform', d => {
      let coords = projection([d.longitude, d.latitude])
      return `translate(${coords})`
    })
    .attr('fill', '#FFFFFF')

  svg
    .selectAll('.flights')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('class', 'flights')
    .attr('d', d => {
      let fromCoords = nyc
      let toCoords = coordinateStore.get(d.iata_code)

      var geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      return path(geoLine)
    })
    .attr('stroke', 'white')
    .attr('fill', 'none')
    .attr('stroke-width', 1)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#A7CFE7')
    .attr('stroke', 'black')
    .lower()
}
