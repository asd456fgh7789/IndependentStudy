class StockController < ApplicationController
  def index
    @symbols = Stocklist.all
    @industry = TwsGecko::IndustryCode.all_industry
  end

  def list
    respond_to do |format|
      format.json do
        render :json =>{
          'column':['股票代碼', '名稱', '上市日期'],
          'data':Stocklist.all.select(:symbol, :name, :listed).as_json(:except => :id)
        }
      end
    end
  end

  def history
    symbol = params[:symbol]
    s = Stocklist.find_by_symbol(symbol.to_s)
    respond_to do |format|
      format.json do
        render :json =>
           s.histories.where("date <= ? and date > ? ", Date.today, Date.today - 5.year).select(
            :date, 
            :share,
            :price,
            :open,
            :high,
            :low,
            :close,
            :diff,
            :volume,
            :sma_15,
            :ema_15,
            :rsi_15,
            :macd_15,
            :pk_9,
            :pd_9,
            :atr,
            :dmi,
            :adx,
            :ema_5,
            :macd,
            :rsi,
            :predict).sort_by{ |i| i['date'] }
      end
    end
  end
end
