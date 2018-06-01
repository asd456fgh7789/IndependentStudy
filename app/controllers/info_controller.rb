class InfoController < ApplicationController
  def index
    symbol = params[:symbol]
    @symbol = Stocklist.find_by_symbol(symbol.to_s)
    @symbol = Stocklist.find_by_symbol(params[:search].to_s) if params[:search]
    return not_found if @symbol.nil?
    @last_close = @symbol.last_close
    @diff = "%s%s" % [@symbol.diff > 0 ? '▲' : '▼', @symbol.diff.abs]
    @diff[0] = '' if @symbol.diff == 0
  end

  private
  def not_found
    render :file => "#{Rails.root}/public/404.html",  :status => 404
  end
end
