module StockHelper
  def collpase_stocklist(array, side)
    side = side.to_s
    str = ''
    Array(array).each_with_index do |name, i|
      symbols = @symbols.where(industry:name)
      next if symbols.empty?
      str << <<-HERE
      <div class="card">
          <div class="card-header" role="tab" id="#{side}_heading#{i}">
            <h5>
              <a data-toggle="collapse" href="##{side}_collpase#{i}" aria-expanded="true" aria-controls="#{side}_collpase#{i}">
                #{name}
              </a>
            </h5>
          </div>
          <div id="#{side}_collpase#{i}" class="collapse" role="tabpanel" aria-labelledby="##{side}_heading#{i}" data-parent="#accordion_#{side}">
            <div class="card-body table-responsive">
              <table class="table table-hover table-sm text-center">
                <thead>
                  <tr class="">
                    <th class="">股票代號</th>
                    <th class="">公司名稱</th>
                    <th class="">收盤價格</th>
                    <th class="">漲跌比率</th>
                  </tr>
                </thead>
                <tbody>
      HERE
      symbols.each do |s|
        t = stock_color(s.diff)
        str << <<-HERE
                  <tr class="clickable-row" data-href="/info?symbol=#{s.symbol}">
                    <td ><a href="info?symbol=#{s.symbol}">#{s.symbol}</a></td>
                    <td >#{s.name}</td>
                    <td >#{s.close}</td>
                    <td class="#{t}">#{s.diff}</td>
                  </tr>
        HERE
      end
      str <<    "</tbody>
              </table>
            </div>
          </div>
      </div>"
    end
    str.html_safe
  end
end
