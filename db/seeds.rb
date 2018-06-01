# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'csv'

def import_symbols()
  ary = TwsGecko::CompanyList.list.map do |row|
   Stocklist.new(
     symbol:row[0],
     name:row[1],
     isin:row[2],
     listed:row[3],
     tse_otc:row[4],
     industry:row[5],
     cfi:row[6],
     note:row[7]
   )
  end
  Stocklist.import ary, validate: true
end

def import_history(symbol)
  s = Stocklist.where("symbol = #{symbol}")[0]
  #TwsGecko::Validation.history s.symbol
  ary = CSV.foreach("data/#{symbol}.csv").map do |row|
    d = row[0].split('/').map {|i| i.to_i}
    d = Date.new(d[0] + 1911, d[1], d[2])
    History.new(
      stocklist_id:s.id,
      date:d,
      share:row[1],
      price:row[2],
      open:row[3],
      high:row[4],
      low:row[5],
      close:row[6],
      diff:row[7],
      volume:row[8]
    )
  end
  History.import ary, validate: true

  last = History.where("stocklist_id = #{s.id}")[-2..-1]
  s.update(
    share:last[1].share,
    price:last[1].price,
    open:last[1].open,
    high:last[1].high,
    low:last[1].low,
    close:last[1].close,
    last_close:last[0].close,
    diff:last[1].diff,
    volume:last[1].volume
  )
end

import_symbols()
[1101, 1102, 1103, 1104, 1108, 1109, 1110].map(&:to_s).each do |i|
#TwsGecko::CompanyList.symbols.each do |i| 
  begin
    import_history i; print "#{i}\r"
  rescue StandardError => e
    p e.message, i, e.traceback
  end
end
#=end