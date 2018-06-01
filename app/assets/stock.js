
// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require history
var stock_list = null;
var symbol = null;

function list_request(){
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: 'stock/list',
        dataType: 'json',
        success: function (data) {
            stock_list = data;
            list_table(data);
            list_select(data);
        },
        error: function (result) {
            d => console.log('error');
        }
    });
}
 
function list_table(data) {
    var table = d3.select('#stock_list_table');
    var thead = table.append('thead').attr('class','thead-inverse');
    var	tbody = table.append('tbody');
    
    thead.append('tr')
      .selectAll('th')
      .data(data.column).enter()
      .append('th')
      .text(d => d);
    
    tbody.selectAll('tr')
    .data(data.data).enter().append('tr')
    .selectAll('td')
    .data(d => { return [d.symbol, d.name, d.listed] }).enter().append('td')
    .text(d => d);

    display_status('#col_stocklist');
}

function list_select(data){
    d3.select('#select_dropdown').selectAll('option')
    .data(data.data).enter().append('option')
    .text(d => {return d.symbol + ' ' + d.name});
}

function display_status(str){
    var element = $(str);
    if (element.hasClass('d-none')) element.removeClass('d-none');
    else element.addClass('d-none');
}

var ready;
ready = function() {
  $('#stock_list').click(d => {
      display_status('#col_stocklist');
  });
  $('#history').click(d => {
      var new_symbol = d3.select('#select_dropdown').property('value').split(' ')[0];
      if (new_symbol != symbol){
          symbol = new_symbol;
          history_request(symbol);
      }else{
          display_status('#history_chart');
      }
  });
};

$(document).ready(ready);
$(document).on('page:load', ready);
list_request();
