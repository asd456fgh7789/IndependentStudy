$.ajax({
  url: 'https://d3js.org/d3-zoom.v1.min.js',
  dataType: "script",
  success: console.log("d3-zoom v1 loaded successfully.")
});

var symbol = $('#stock-symbol').text();

function stock_chart(){
/* global d3 */
  var chart_width = parseInt(d3.select('#stock-chart').style("width")) -  parseInt($('#stock-chart').css('padding-left'));
  var chart_height = chart_width > 768 ? chart_width * 5 / 16 : 283;
  var size = {width: chart_width, height: chart_height};
  var margin = {top: 30, right: 20, bottom: 100, left: 20}, 
    margin2  = {top: 210, right: 20, bottom: 20, left: 20},
    width    = size.width - margin.left - margin.right,
    height   = size.height - margin.top - margin.bottom,
    height2  = size.height - margin2.top - margin2.bottom;
    
  var svg_height = size.height + height2;
  var area_height = height2;

  var parseDate = d3.timeParse('%Y-%m-%d'),
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    legendFormat = d3.timeFormat('%b %d, %Y');

  var x = d3.scaleTime().range([0, width]),
    x2  = d3.scaleTime().range([0, width]),
    y   = d3.scaleLinear().range([height, 0]),
    y1  = d3.scaleLinear().range([height, 0]),  
    y2  = d3.scaleLinear().range([height2, 0]),
    y3  = d3.scaleLinear().range([area_height, 0]);

  var xAxis = d3.axisBottom(x),
    xAxis2  = d3.axisBottom(x2),
    yAxis   = d3.axisLeft(y);

  var priceLine = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

  var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.price); });

  var svg = d3.select('#stock-chart').append('svg')
    .attr('class', 'chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', svg_height + margin.top + margin.bottom + area_height);


  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
  .append('rect')
    .attr('width', width)
    .attr('height', height);

  var make_y_axis = function () {
    return d3.axisLeft(y)
      .ticks(5)
  };
  console.log(size.height, height, height2);
  var focus = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var barsGroup = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top +  height +  margin2.bottom) + ')');

  var context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + margin2.left + ',' + (height + height2 + margin.top + margin2.bottom) + ')');

  var legend = svg.append('g')
    .attr('class', 'chart__legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', 'translate(' + margin2.left + ', 10)');

  legend.append('text')
    .attr('class', 'chart__symbol')
    .text('TPE: ' + symbol);

  var rangeSelection =  legend
    .append('g')
    .attr('class', 'chart__range-selection')
    .attr('transform', 'translate(110, 0)');
  
  d3.json('stock/history?symbol=' + symbol, function(err, data) {
    if (err) console.log(err);
    data = type(data);

    data = data.filter(function(d){
        if(isNaN(d.price) || d.price == 0){
            return false;
        }
        d.price = parseInt(d.price, 10);
        return true;
    });

    var brush = d3.brushX()
      .extent([[x2.range()[0], 0], [x2.range()[1], y3.range()[0]]])
      .on('brush', brushed);
      
    var xRange = d3.extent(data.map(function(d) { return d.date; }));

    x.domain(xRange);
    y.domain(d3.extent(data.map(function(d) { return d.price; })));
    y3.domain(d3.extent(data.map(function(d) { return d.price; })));
    x2.domain(x.domain());
    y2.domain(y.domain());

    var min = d3.min(data.map(function(d) { return d.price; }));
    var max = d3.max(data.map(function(d) { return d.price; }));

    var range = legend.append('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    focus.append('g')
        .attr('class', 'y chart__grid')
        .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickFormat(''));

    var priceChart = focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus line')
        .attr('d', priceLine);

    focus.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0 ,' + height + ')')
        .call(xAxis);

    focus.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(12, 0)')
        .call(yAxis);

    var focusGraph = barsGroup.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('class', 'chart__bars')
        .attr('x', function(d, i) { return x(d.date); })
        .attr('y', function(d) { return height2 - y3(d.price); })
        .attr('width', 1)
        .attr('height', function(d) { return y3(d.price); });

    var helper = focus.append('g')
      .attr('class', 'chart__helper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    var helperText = helper.append('text')

    var priceTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--price')
      .append('circle')
      .style('display', 'none')
      .attr('r', 2.5);

    var mouseArea = svg.append('g')
      .attr('class', 'chart__mouse')
      .append('rect')
      .attr('class', 'chart__overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .on('mouseover', function() {
        helper.style('display', null);
        priceTooltip.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        priceTooltip.style('display', 'none');
      })
      .on('mousemove', mousemove);

    context.append('path')
        .datum(data)
        .attr('class', 'chart__area area')
        .attr('d', area2);

    context.append('g')
        .attr('class', 'x axis chart__axis--context')
        .attr('y', 0)
        .attr('transform', 'translate(0,' + (height2 - 22) + ')')
        .call(xAxis2);

    // for d3 v4
    var brushSel = context.append('g')
        .attr('class', 'x brush')
        .call(brush);
    
    brushSel.selectAll('rect')
        .attr('y', -6)
        .attr('height', height2 + 7);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisectDate(data, x0, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      helperText.text(legendFormat(new Date(d.date)) + ' - Price: ' + d.price);
      priceTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price) + ')');
    }

    function brushed(extent) {
      var ext = extent ? extent : d3.brushSelection(this).map(x2.invert);
      if(ext[0] < data[0].date) ext[0] = data[0].date;
      if(ext[1] > data[data.length - 1].date) ext[1] = data[data.length - 1].date;
      x.domain(ext);
      y.domain([
        d3.min(data.map((d) => { return (d.date >= ext[0] && d.date <= ext[1]) ? d.price : max; })),
        d3.max(data.map((d) => { return (d.date >= ext[0] && d.date <= ext[1]) ? d.price : min; }))
      ]);
      range.text(legendFormat(new Date(ext[0])) + ' - ' + legendFormat(new Date(ext[1])))
      focusGraph.attr('x', (d, i) => { return x(d.date); });

      var days = Math.ceil((ext[1] - ext[0]) / (24 * 3600 * 1000))
      focusGraph.attr('width', (40 > days) ? (40 - days) * 5 / 6 : 5)
      priceChart.attr('d', priceLine);
      focus.select('.x.axis').call(xAxis);
      focus.select('.y.axis').call(yAxis);
    }

    var dateRange = ['1w', '1m', '3m', '6m', '1y', '5y']
    for (var i = 0, l = dateRange.length; i < l; i ++) {
      var v = dateRange[i];
      rangeSelection
        .append('text')
        .attr('class', 'chart__range-selection')
        .text(v)
        .attr('transform', 'translate(' + (18 * i) + ', 0)')
        .on('click', function(d) { focusOnRange(this.textContent); });
    }

    function focusOnRange(range) {
      var today = new Date(data[data.length - 1].date)
      var ext = new Date(data[data.length - 1].date)

      if (range === '1m')
        ext.setMonth(ext.getMonth() - 1)

      if (range === '1w')
        ext.setDate(ext.getDate() - 7)

      if (range === '3m')
        ext.setMonth(ext.getMonth() - 3)

      if (range === '6m')
        ext.setMonth(ext.getMonth() - 6)

      if (range === '1y')
        ext.setFullYear(ext.getFullYear() - 1)

      if (range === '5y')
        ext.setFullYear(ext.getFullYear() - 5)

      if (ext < data[0].date)
        ext = data[0].date;
      brushed([ext, today]);
    }

  })// end Data

  function type(data) {
    return data.map((d) => {
      return {
        date   : parseDate(d.date),
        price  : +d.close,
        volume : +parseInt(d.volume)
      }
    })
  }
}

var ready = function() {
  stock_chart();
};

$(document).ready(ready);
$(document).on('page:load', ready);
