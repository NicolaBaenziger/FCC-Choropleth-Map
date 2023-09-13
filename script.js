// Constants
const educationDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

// SVG Dimensions
const width = 800;
const height = 500;

// Create SVG element
const svg = d3.select('#map')
    .attr('width', width)
    .attr('height', height);

// Tooltip
const tooltip = d3.select('#tooltip');
const tooltipText = d3.select('#tooltip-text');

// Load and render data
Promise.all([d3.json(educationDataUrl), d3.json(countyDataUrl)])
    .then(([educationData, countyData]) => {
        // Define color scale for legend
        const colorScale = d3.scaleThreshold()
            .domain([3, 12, 21, 30, 39, 48, 57, 66])
            .range(d3.schemeBlues[9]);

        // Create legend
        const legend = d3.select('#legend');
        const legendColors = colorScale.range();
        legendColors.forEach((color, i) => {
            legend.append('div')
                .style('background-color', color)
                .classed('legend-item', true)
                .text(`${i * 10}% - ${(i + 1) * 10}%`);
        });

        // Create counties
        svg.selectAll('path')
            .data(topojson.feature(countyData, countyData.objects.counties).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('data-fips', d => d.id)
            .attr('data-education', d => {
                const county = educationData.find(item => item.fips === d.id);
                return county ? county.bachelorsOrHigher : 0;
            })
            .attr('fill', d => {
                const county = educationData.find(item => item.fips === d.id);
                return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
            })
            .attr('d', d3.geoPath())
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);
    });

// Tooltip event handlers
function handleMouseOver(event, d) {
    const education = d3.select(this).attr('data-education');
    const county = d3.select(this).attr('data-fips');

    tooltipText.html(() => {
        const countyData = educationData.find(item => item.fips === county);
        return `${countyData.area_name}, ${countyData.state}: ${countyData.bachelorsOrHigher}%`;
    });

    tooltip.classed('visible', true)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .attr('data-education', education);
}

function handleMouseOut() {
    tooltip.classed('visible', false);
}