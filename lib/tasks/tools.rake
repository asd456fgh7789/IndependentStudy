require 'tws_gecko'
require "ruby-progressbar"
require Rails.root.to_s + '/lib/tasks/ta.rb'
require Rails.root.to_s + '/lib/tasks/classifer.rb'

namespace :tools do
  
  desc 'Verify data'
  task :verify_all => :environment do
    TwsGecko::CompanyList.symbols.each do |s|
      TwsGecko::Validation.history s
      p s
    end
  end

  task :ta => :environment do
    pb = ProgressBar.create(
        :title => "[TA]",
        :starting_at => 0,
        :progress_mark => '>',
        :remainder_mark => '#',
        :format => '%t[[%B]]%P% %E',
        :total => 7, #Stocklist.all.size,
        :length => 75
    )
    #Stocklist.all.each do |symbol|
    [1101, 1102, 1103, 1104, 1108, 1109, 1110].map {|i| Stocklist.find_by_symbol(i.to_s)}.each do |symbol|
      #next unless [1101, 1102, 1103, 1104, 1108, 1109, 1110].map(&:to_s).include? symbol.symbol.to_s
      date_range = (Date.today - 5.year .. Date.today - 1.day).to_a
      date_range.each do |d|
        today = History.where("date = ? and stocklist_id = ?", d, symbol.id).limit(1)
        next unless today.first
        today = today.first
        next if today.open == 0
        rows =  History.where("stocklist_id = ? and date < ? and open != 0", symbol.id, d).order("date desc").limit(26)
        rows = rows.reverse
        next if rows.nil? || rows.size < 26
        rows_extra = rows.slice!(15, 11)
        close = rows.map(&:close)
        close_extra = rows_extra.map(&:close)
        high = rows.map(&:high)
        low = rows.map(&:low)
        p_K, p_D = TechAnalysis.kd(close, high, low, 9).transpose
        today.sma_15 = TechAnalysis.sma(close, 15)[-1]
        today.ema_15 = TechAnalysis.ema(close, 15)[-1]
        today.rsi_15 = TechAnalysis.rsi(close + [close_extra.first], 15)[-1]
        today.macd_15 = TechAnalysis.macd(close + close_extra, 15)[-1]
        today.atr = TechAnalysis.atr(close, high, low, 15)[-1]
        today.pK_9 = p_K[-1]
        today.pD_9 = p_D[-1]
        today.dmi = TechAnalysis.dmi(close, high, low)[-1]
        today.adx = TechAnalysis.adx(close, high, low)[-1]
        today.ema_5 = TechAnalysis.ema(close)[-1]
        today.rsi = TechAnalysis.rsi(close)[-1]
        today.macd = TechAnalysis.macd(close + close_extra)[-1]
        today.save
      end
      pb.progress += 1
    end
  end
  
  desc 'ML'
  task :ml => :environment do
    pb = ProgressBar.create(
        :title => "[ML]",
        :starting_at => 0,
        :progress_mark => '>',
        :remainder_mark => '#',
        :format => '%t[[%B]]%P% %E',
        :total => Stocklist.all.size,
        :length => 75
    )
    Stocklist.all.each do |symbol|
      next unless [1101, 1102, 1103, 1104, 1108, 1109, 1110].map(&:to_s).include? symbol.symbol.to_s
      (Date.today - 20.day .. Date.today - 1.day).to_a.each do |d|
        data = History.where("date <= ? and stocklist_id = ? and open != 0", d, symbol.id).order('date desc').limit(16)
        data = data.reverse
        next if data.size < 16 
        today = data[-1]
        data.map! do |i|
          [ 
            i.date, i.open, i.high, i.low, i.close, i.diff, i.volume, 
            i.sma_15, i.ema_15, i.rsi_15, i.macd_15, i.atr, i.pK_9, i.pD_9, i.dmi, i.adx, i.ema_5, i.rsi, i.macd
          ]
        end
        classifer = DiffClassifier.new(data, 5, d, 15)
        today.predict = (classifer.predict()[0].to_s == 'True') ? true : false
        today.save
      end
      pb.progress += 1
    end
  end
end