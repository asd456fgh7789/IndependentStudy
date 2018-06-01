require 'tws_gecko'
require "ruby-progressbar"

namespace :tools do
  desc 'Updating Daily Data'
  task :today => :environment do
    d = TwsGecko::Date.today
    #d = Date.new(2018, 5, 30)
    Rake::Task["tools:update_companyinfo"].invoke
    (Date.today - 5.year .. Date.today - 1.day).to_a.each do |d|
    next if d.wday != 6 && d.wday != 7
    begin
    c = TwsGecko::MiIndex.new(d)
    
    pb = ProgressBar.create(
      :title => "[#{d}]",
      :starting_at => 0,
      :progress_mark => '>',
      :remainder_mark => '#',
      :format => '%t[[%B]]%p%',
      :total => Stocklist.all.size,
      :length => 75
    )
    ary = []
    c.data.each do |row|
      s = Stocklist.find_by_symbol(row[0])
      next if s.nil?
      pb.progress += 1
      row[10] = ('-' + row[10]) if row[9].gsub(/<\/?[^>]*>/, "") == '-'
      s.update(
        share:row[2],
        price:row[4],
        open:row[5],
        high:row[6],
        low:row[7],
        close:row[8],
        last_close:s.close,
        diff:row[10].to_f,
        volume:row[3]
      )
      ary << History.new(
        stocklist_id:s.id,
        date:c.date,
        share:row[2],
        price:row[4],
        open:row[5],
        high:row[6],
        low:row[7],
        close:row[8],
        diff:row[10].to_f,
        volume:row[3]
      )
    end
    rescue
    next
  end
    History.import ary, validate: true
    c.each_save(listed:true)
    puts
  end
  end
  task :update_companyinfo => :environment do
    old_symbols = TwsGecko::CompanyList.symbols
    TwsGecko::CompanyList.update
    ary = (TwsGecko::CompanyList.symbols - old_symbols).map do |s|
      row = TwsGecko::CompanyList.symbols.find {|i| i[0] == s}
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

  task :update_stocklist => :environment do
    pb = ProgressBar.create(
      :title => "[StocklistUpdate]:",
      :starting_at => 0,
      :progress_mark => '>',
      :remainder_mark => '#',
      :format => '%t%B(%c/%C)%p%',
      :total => Stocklist.all.size,
      :length => 100
    )
    Stocklist.all.each_with_index do |i, index|
      pb.progress += 1
      
    end
  end

  task :t do
    Dir.foreach('data/history') do |i|
      p i
      next if File.exist? i
      arr = CSV.read('data/history/' + i)
      arr.pop
      CSV.open('data/history/' + i, 'w') do |csv|
        arr.each {|r| csv << r}
      end
    end
  end
end