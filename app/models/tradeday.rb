class Tradeday < ApplicationRecord
  belongs_to :stocklist
  has_many :realtimes
end
