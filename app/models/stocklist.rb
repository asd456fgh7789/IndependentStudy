class Stocklist < ApplicationRecord
  has_many :tradedays
  has_many :histories
  
  validates_uniqueness_of :symbol
  validates_inclusion_of :tse_otc, :in => ['上市', '上櫃']
  
end
