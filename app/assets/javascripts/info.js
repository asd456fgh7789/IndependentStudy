/* global d3 */
/* global $ */

var symbol = $('#stock-symbol').text();

var Box = function(name, width, height, padding, offset_up) {
  this.width = width;
  this.height = height;
  this.padding = padding;
  this.offset_up = offset_up;

  this.inner_width = width - 2 * padding;
  this.inner_height = height - padding;
  this.axis_offset_up = this.offset_up + this.inner_height;

  this.x = d3.scaleTime().range([0, this.inner_width]);
  this.y = d3.scaleLinear().range([this.inner_height, 0]);

  this.xAxis = d3.axisBottom(this.x);
  this.yAxis = d3.axisLeft(this.y).ticks(3);
  if(name){
    this.html_info = d3.select('#' + name + '_info')
      .attr('style', 'height:' + this.inner_height + 'px;margin-bottom:' + padding + 'px;');
  }
};

function stock_chart() {
  var data;

  d3.json('stock/history?symbol=' + symbol, function(err, dat) {
    if (err) console.log(err);
    dat = type(dat);

    dat = dat.filter(function(d) {
      if (isNaN(d.close) || d.close == 0) {
        return false;
      }
      return true;
    });
    data = dat;
    data_process();
  }); // end Data

  var width = parseInt(d3.select('#stock-chart').style("width"), 10) - parseInt($('#stock-chart').css('padding-left'), 10);
  var padding = 30;

  var x_height = width > 768 ? width * 1 / 20 : 50, 
    s_height = width > 768 ? width * 2 / 20 : 100,
    m_height = width > 768 ? width * 4 / 20 : 250,
    l_height = width > 768 ? width * 6 / 20 : 400;

  // Set Box
  var boxes = ['title', 'chart', 'bars', 'predict', 'tl', 'kd', 'rsi', 'macd'];
  var titleBox = new Box(boxes[0], width, x_height, 0, padding);
  var chartBox = new Box(boxes[1], width, l_height, padding, titleBox.offset_up + titleBox.height);
  var barsBox = new Box(boxes[2], width, s_height, padding, chartBox.offset_up + chartBox.height);
  var predictBox = new Box(boxes[3], width, 50, padding, barsBox.offset_up + barsBox.height);
  var tlBox = new Box(boxes[4], width, s_height, padding, predictBox.offset_up + predictBox.height);
  var kdBox = new Box(boxes[5], width, s_height, padding, tlBox.offset_up + tlBox.height);
  var rsiBox = new Box(boxes[6], width, s_height, padding, kdBox.offset_up + kdBox.height);
  var macdBox = new Box(boxes[7], width, s_height, padding, rsiBox.offset_up + rsiBox.height);
  
  titleBox.html_info = d3.select('#title_info')
      .style('height', titleBox.height + padding + 'px');
  if(chartBox.height < 1200){
    d3.selectAll('#chart_info div')
      .style('height', chartBox.inner_height / 6 + 'px');
  }
  predictBox.html_info = d3.select('#predict_info')
      .style('height', predictBox.height + padding + 'px;margin-bottom:0px');

  tlBox.xAxis.tickFormat(d3.timeFormat("%Y/%m"));
  barsBox.yAxis.tickFormat(d3.format(".0s"));
  kdBox.yAxis.tickFormat(d3.format(".1"));
  rsiBox.yAxis.tickFormat(d3.format(".1"));
  macdBox.yAxis.tickFormat(d3.format(".1")).ticks(2);
  
  var svgBox = new Box(null, width, macdBox.offset_up + macdBox.height, 0, padding);

  var parseDate = d3.timeParse('%Y-%m-%d'),
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    legendFormat = d3.timeFormat('%Y/%m/%d');

  // Making Lines
  var chartlines = ['sma_15', 'ema_5', 'ema_15'];

  var chartlines_obj = chartlines.map((name) => {
    return d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => { return chartBox.x(d.date); })
      .y((d) => { return chartBox.y(d[name]); });
  });

  var kdlines = ['k9', 'd9'];
  var kdlines_obj = kdlines.map((name) => {
    return d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => { return kdBox.x(d.date); })
      .y((d) => { return kdBox.y(d[name]); });
  });

  var rsiline = 'rsi';
  var rsiline_obj = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => { return rsiBox.x(d.date); })
      .y((d) => { return rsiBox.y(d[rsiline]); });

  var macdlines = ['macd_9', 'macd_15'];
  var macdlines_obj = macdlines.map((name) => {
    return d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => { return macdBox.x(d.date); })
      .y((d) => { return macdBox.y(d[name]); });
  });

  var timeLine = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return tlBox.x(d.date); })
    .y0(tlBox.inner_height)
    .y1(function(d) { return tlBox.y(d.close); });

  var svg = d3.select('#stock-chart').append('svg')
    .attr('class', 'chart')
    .attr('width', svgBox.width)
    .attr('height', svgBox.height);

  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', chartBox.inner_width)
    .attr('height', chartBox.inner_height);

  // Draw Chart
  var title = svg.append('g')
    .attr('class', 'chart__legend')
    .attr('style', 'width:' + titleBox.inner_width + 'px; height' + titleBox.height + 'px;')
    .attr('transform', 'translate(' + 0 + ', ' + titleBox.offset_up + ')');
  
  var rangeSelection = title.append('g')
    .attr('class', 'chart__range-selection')
    .attr('transform', 'translate(0, 0)');

  var klinesChart = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('class', 'klines')
    .attr('transform', 'translate(' + padding + ',' + chartBox.offset_up + ')');

  var focus = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + padding + ',' + chartBox.offset_up + ')');

  var barsChart = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('transform', 'translate(' + padding + ',' + barsBox.offset_up + ')');

  var predictChart = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('class', 'predict')
    .attr('transform', 'translate(' + padding + ',' + predictBox.offset_up + ')');

  var tlChart = svg.append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + padding + ',' + tlBox.offset_up + ')');

  var kdChart = svg.append('g')
    .attr('class', 'kd')
    .attr('transform', 'translate(' + padding + ',' + kdBox.offset_up + ')');

  var rsiChart = svg.append('g')
    .attr('class', 'rsi')
    .attr('transform', 'translate(' + padding + ',' + rsiBox.offset_up + ')');

  var macdChart = svg.append('g')
    .attr('class', 'macd')
    .attr('transform', 'translate(' + padding + ',' + macdBox.offset_up + ')');

  
  function data_process() {
    var correct_n = 0;
    for(var i = data.length - 20; i < data.length; ++i){
      if((data[i].diff >= 0 && data[i].predict == true) || (data[i].diff < 0 && data[i].predict == false)){
        correct_n = correct_n + 1;
      }
    }
    d3.select('#predict_accuracy').text(Math.round(correct_n / 20 * 10000) / 100 + '%');
    var brush = d3.brushX()
      .extent([
        [tlBox.x.range()[0], 0],
        [tlBox.x.range()[1], tlBox.y.range()[0]]
      ])
      .on('brush', brushed);
    
    var predict = data[data.length - 1].predict;
    d3.select('#predict').text((predict == true) ? '漲' : '跌')
      .style('color', (predict == true) ? 'Crimson' : 'darkgreen');
    
    var xRange = d3.extent(data.map((d) => { return d.date; }));
    // Set domain
    chartBox.x.domain(xRange);
    chartBox.y.domain(d3.extent(data.map((d) => { return d.close; })));
    barsBox.y.domain(d3.extent(data.map((d) => { return d.volume; })));
    tlBox.x.domain(chartBox.x.domain());
    tlBox.y.domain(chartBox.y.domain());
    kdBox.x.domain(chartBox.x.domain());
    kdBox.y.domain([0, 1]);
    rsiBox.x.domain(chartBox.x.domain());
    rsiBox.y.domain([0, 1]);
    macdBox.x.domain(chartBox.x.domain());
    macdBox.y.domain([-1, d3.max(data.map((d) => { return d.macd_9; })) + 0.1]);

    var range = title.append('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + titleBox.inner_width + ', 0)');
    
    // Draw Axis Grid
    var chart_ygrid = focus.append('g')
      .attr('class', 'y chart__grid')
      .call(d3.axisLeft(chartBox.y).ticks(5).tickSize(-chartBox.inner_width, 0, 0));

    barsChart.append('g')
      .attr('class', 'x chart__grid')
      .call(d3.axisTop(barsBox.x).ticks(1).tickSize(-barsBox.inner_height, 0, 0));

    kdChart.append('g')
      .attr('class', 'y chart__grid')
      .call(d3.axisLeft(kdBox.y).ticks(3).tickSize(-kdBox.inner_width, 0, 0));

    rsiChart.append('g')
      .attr('class', 'y chart__grid')
      .call(d3.axisLeft(rsiBox.y).ticks(3).tickSize(-rsiBox.inner_width, 0, 0));

    macdChart.append('g')
      .attr('class', 'y chart__grid')
      .call(d3.axisLeft(macdBox.y).ticks(3).tickSize(-macdBox.inner_width, 0, 0));


    // Draw Lines
    var chart_obj = chartlines.map((name, i) => {
      return focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus ' + name + '_line')
        .attr('d', chartlines_obj[i]);
    });
    
    var kdchart_obj = kdlines.map((name, i) => {
      return kdChart.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus ' + name + '_line')
        .attr('d', kdlines_obj[i]);
    });
    
    var rsichart_obj = rsiChart.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus ' + rsiline + '_line')
        .attr('d', rsiline_obj);

    var macdchart_obj = macdlines.map((name, i) => {
      return macdChart.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus ' + name + '_line')
        .attr('d', macdlines_obj[i]);
    });
    
    var kbarsGraph = klinesChart.append('g').selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('class', 'k_bars')
      .attr('x', function(d) { return chartBox.x(d.date); })
      .attr('width', 1)
      .attr('transform', 'translate(0, 0)')
      .style('fill', function(d) { return (d.diff > 0) ? 'Crimson' : 'darkgreen'});

    var klinesGraph = klinesChart.append('g').selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('class', 'k_lines')
      .attr('x', function(d) { return chartBox.x(d.date); })
      .attr('width', 1)
      .attr('transform', 'translate(0, 0)')
      .style('fill', function(d) { return (d.diff > 0) ? 'Crimson' : 'darkgreen'});
    
    var predictGraph = predictChart.append('g').selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('class', 'predict_bars')
      .attr('x', function(d) { return chartBox.x(d.date); })
      .attr('width', 1)
      .attr('height', predictBox.inner_height)
      .attr('transform', 'translate(0, 0)')
      .style('fill', (d) => {
        if(d.predict == null) return 'rgba(0, 0, 0, 0)';
        return (d.predict == true) ? 'Crimson' : 'darkgreen';
      });
    
    // Draw Axis
    focus.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0 ,' + chartBox.inner_height + ')')
      .call(chartBox.xAxis);

    focus.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (-padding / 2) + ', 0)')
      .call(chartBox.yAxis);

    // bars line
    var focusGraph = barsChart.selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('class', 'chart__bars')
      .attr('x', function(d) { return barsBox.x(d.date); })
      .attr('y', function(d) { return barsBox.y(d.volume); })
      .attr('width', 1)
      .attr('height', function(d) { return barsBox.inner_height - barsBox.y(d.volume); })
      .attr('transform', 'translate(0, 0)');

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (padding / 2) + ',' + barsBox.offset_up + ')')
      .call(barsBox.yAxis);

    kdChart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (-padding / 2) + ',' + 0 + ')')
      .call(kdBox.yAxis);

    rsiChart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (-padding / 2) + ',' + 0 + ')')
      .call(rsiBox.yAxis);

    macdChart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (-padding / 2) + ',' + 0 + ')')
      .call(macdBox.yAxis);


    var vert_line_up = focus.append('g').append('line')
      .attr('class', 'vert_line')
      .attr('y0', 0)
      .style('display', 'none')
      .attr('y1', barsBox.height + chartBox.height - padding);
    
    var vert_line_bottom = kdChart.append('g').append('line')
      .attr('class', 'vert_line')
      .attr('y0', 0)
      .style('display', 'none')
      .attr('y1', kdBox.height + rsiBox.height + macdBox.height - padding);
    
    var helper = title.append('g')
      .attr('class', 'chart__helper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + titleBox.inner_width + ',' + padding + ')');

    var helperText = helper.append('text');

    var priceTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--price')
      .append('circle')
      .style('display', 'none')
      .attr('r', 2.5);

    var mouseArea = svg.append('g')
      .attr('class', 'chart__mouse')
      .append('rect')
      .attr('class', 'chart__overlay')
      .attr('width', xRange[1] - xRange[0])
      .attr('height', chartBox.inner_height)
      .attr('transform', 'translate(' + padding + ',' + chartBox.offset_up + ')')
      .on('mouseover', function() {
        helper.style('display', null);
        priceTooltip.style('display', null);
        vert_line_up.style('display', null);
        vert_line_bottom.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        priceTooltip.style('display', 'none');
        vert_line_up.style('display', 'none');
        vert_line_bottom.style('display', 'none');
      })
      .on('mousemove', mousemove);

    tlChart.append('path')
      .datum(data)
      .attr('class', 'chart__area area')
      .attr('d', timeLine);

    tlChart.append('g')
      .attr('class', 'x axis chart__axis--context')
      .attr('y', 0)
      .attr('transform', 'translate(-' + padding + ',' + tlBox.inner_height + ')')
      .call(tlBox.xAxis);

    // for d3 v4
    var brushSel = tlChart.append('g')
      .attr('class', 'x brush')
      .call(brush);

    brushSel.selectAll('rect')
      .attr('height', tlBox.inner_height);

    function mousemove() {
      var x0 = chartBox.x.invert(d3.mouse(this)[0]);
      var i = bisectDate(data, x0, 1);
      var d0 = chartBox.x(data[i - 1].date) <= 0? data[i] : data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      priceTooltip.attr('transform', 'translate(' + chartBox.x(d.date) + ',' + chartBox.y(d.close) + ')');
      vert_line_up.attr('transform', 'translate(' + chartBox.x(d.date) + ',' + 0 + ')');
      vert_line_bottom.attr('transform', 'translate(' + chartBox.x(d.date) + ',' + 0 + ')');
      update_info(d);
    }

    function brushed(extent) {
      var ext = extent ? extent : d3.brushSelection(this).map(tlBox.x.invert);
      var days = Math.ceil((ext[1] - ext[0]) / (24 * 3600 * 1000));

      if (ext[0] <= data[0].date)               ext[0] = data[0].date;
      if (ext[1] >= data[data.length - 1].date) ext[1] = data[data.length - 1].date;

      if (days < 5) {
        if (ext[0] - days < data[0].date) ext[1].setDate(ext[0].getDate() + 5);
        else ext[0].setDate(ext[1].getDate() - 5);
        brush.extent([
          [tlBox.x(ext[0]), 0],
          [tlBox.x(ext[1]), tlBox.y.range()[0]]
        ]);
        return;
      }
      chartBox.x.domain(ext)
        .range([chartBox.inner_width / days / 2, (days - 0.5) * chartBox.inner_width / days]);

      var cols_data = (d) => {
        return [d.high, d.low, d.open, d.close, d.sma_15, d.ema_15, d.ema_5];
      };

      var interval_data = data.filter(function(d) {
        return (d.date < ext[0] || d.date > ext[1]) ? false : true;
      });
      
      var flatten_data = interval_data.map(cols_data);
      flatten_data = [].concat.apply([], flatten_data);
      chartBox.y.domain([
        d3.min(flatten_data) - 1,
        d3.max(flatten_data) + 1
      ]);

      var charBox_width = chartBox.x.range()[1] - chartBox.x.range()[0];
      var diff = Math.ceil(chartBox.y.domain()[1] - chartBox.y.domain()[0]);

      kbarsGraph.attr('x', (d) => { return chartBox.x(d.date) ;})
        .attr('width', (charBox_width / days > 4) ? charBox_width / days : 4)
        .attr('transform', 'translate(' + (-kbarsGraph.attr('width') / 2) + ', 0)')
        .attr('y', function(d) { return chartBox.y(d3.max([d.open, d.close])); })
        .attr('height', function(d) { 
          var height = chartBox.y(d3.min([d.open, d.close])) - chartBox.y(d3.max([d.open, d.close]));
          return  (height != 0) ? height : 1;
        });
      
      predictGraph.attr('x', (d) => { return chartBox.x(d.date) ;})
        .attr('width', (charBox_width / days > 4) ? charBox_width / days : 4)
        .attr('transform', 'translate(' + (-kbarsGraph.attr('width') / 2) + ', 0)')
      
      
      klinesGraph.attr('x', (d) => { return chartBox.x(d.date) ;})
        .attr('width', 2)
        .attr('transform', 'translate(' + (-klinesGraph.attr('width') / 2) + ', 0)')
        .attr('y', function(d) { return chartBox.y(d.high); })
        .attr('height', function(d) { return chartBox.y(d.low) - chartBox.y(d.high) });
      
      chartBox.xAxis.tickFormat((days < 180) ? d3.timeFormat("%m/%d") : d3.timeFormat("%Y/%m"));
      chartBox.xAxis.ticks((days < 10) ? days : 10);
      chartBox.yAxis.ticks((diff < 6) ? diff : 6);
      chart_ygrid.call(d3.axisLeft(chartBox.y).ticks(5).tickSize(-chartBox.inner_width, 0, 0));

      range.text(legendFormat(new Date(ext[0])) + ' - ' + legendFormat(new Date(ext[1])));
      focusGraph.attr('x', (d) => { return chartBox.x(d.date); });
      focusGraph.attr('width', (240 > days) ? (barsBox.inner_width / days) - 2 : 3);
      focusGraph.attr('transform', 'translate(' + (-focusGraph.attr('width') / 2) + ', 0)');


      chartlines.map((name, i) => { chart_obj[i].attr('d', chartlines_obj[i]); });
      
      // update domain
      kdBox.x.domain(ext).range(chartBox.x.range());
      kdlines.map((name, i) => { kdchart_obj[i].attr('d', kdlines_obj[i]); });
      rsiBox.x.domain(ext).range(chartBox.x.range());
      rsichart_obj.attr('d', rsiline_obj);
      macdBox.x.domain(ext).range(chartBox.x.range());
      var macd_data = interval_data.map((d) => { return [d.macd_9, d.macd_15]; });
      macd_data = [].concat.apply([], macd_data);
      macdBox.y.domain([
        d3.min(macd_data) - 0.01,
        d3.max(macd_data) + 0.01
      ]);
      macdlines.map((name, i) => { macdchart_obj[i].attr('d', macdlines_obj[i]); });

      focus.select('.x.axis').call(chartBox.xAxis);
      focus.select('.y.axis').call(chartBox.yAxis);
      
    }

    var dateRange = ['一星期', '一個月', '三個月', '六個月', '一年', '五年'];

    for (var i = 0, sum = 0, l = dateRange.length; i < l; i++) {
      var v = dateRange[i];
      rangeSelection
        .append('text')
        .attr('class', 'chart__range-selection')
        .text(v)
        .attr('transform', 'translate(' + ((sum) * 12 + i * padding)+ ', 0)')
        .on('click', function(d) {
          focusOnRange(this.textContent);
        });
      sum += v.length;
    }

    function focusOnRange(range) {
      var today = new Date(data[data.length - 1].date);
      var ext = new Date(data[data.length - 1].date);
      if (range === dateRange[0]) ext.setDate(ext.getDate() - 7);
      if (range === dateRange[1]) ext.setMonth(ext.getMonth() - 1);
      if (range === dateRange[2]) ext.setMonth(ext.getMonth() - 3);
      if (range === dateRange[3]) ext.setMonth(ext.getMonth() - 6);
      if (range === dateRange[4]) ext.setFullYear(ext.getFullYear() - 1);
      if (range === dateRange[5]) ext.setFullYear(ext.getFullYear() - 5);
      if (ext < data[0].date) ext = data[0].date;
      brushed([ext, today]);
    }

    focusOnRange(dateRange[1]);
    checkbox_update();
    update_info(data[data.length - 1]);
  }

  function checkbox_update() {
    d3.selectAll('#options input').each(function() {
      if (d3.select(this).property("checked")) {
        focus.select('.' + d3.select(this).attr('id') + '_line').style("display", "block");
      } else {
        focus.select('.' + d3.select(this).attr('id') + '_line').style("display", "none");
      }
    });
  }

  d3.selectAll('#options input').on("change", checkbox_update);

  function type(data) {
    return data.map((d) => {
      return {
        date: parseDate(d.date),
        open:  +d.open,
        high:  +d.high,
        low:   +d.low,
        close: +d.close,
        diff:   d.diff,
        volume: +parseInt(d.volume, 10),
        sma_15: +d.sma_15,
        ema_5: +d.ema_5,
        ema_15: +d.ema_15,
        k9: +d.pK_9,
        d9: +d.pD_9,
        rsi: +d.rsi / 100,
        macd_9: d.macd / 100,
        macd_15: d.macd_15 / 100,
        atr: d.atr,
        dmi: d.dmi,
        adx: d.adx,
        predict: d.predict
      };
    });
  }
  
  function update_info(data){
    d3.select('#date_value').text(legendFormat(new Date(data.date)));
    ['open', 'high', 'low', 'close', 'sma_15', 'ema_5', 'ema_15', 'volume', 'rsi', 'k9', 'd9', 'macd_9', 'macd_15'].forEach((name) => {
        d3.select('#' + name + '_value').text(Math.round(data[name] * 1000) / 1000);
    });
    if(data.predict != null){
      d3.select('#predict_value').text(data.predict == true ? '漲': '跌')
      .style('color', data.predict == true ? 'Crimson' : 'Darkgreen');
    }else{
      d3.select('#predict_value').text('無資料')
      .style('color', '');;
    }
  }
}

var ready = function() {
  stock_chart();
};

$(document).ready(ready);
$(document).on('page:load', ready);