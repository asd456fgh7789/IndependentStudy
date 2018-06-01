class History < ApplicationRecord
  belongs_to :stocklist

  validates_presence_of :date

  def import_history(array)
    Array(array).each do |row|
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
    History.import ary, validate: true
    end
  end
end
