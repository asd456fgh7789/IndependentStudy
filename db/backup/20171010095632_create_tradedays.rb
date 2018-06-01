class CreateTradedays < ActiveRecord::Migration[5.1]
  def change
    create_table :tradedays do |t|
      t.date    :date, null:false
      t.timestamps
    end
  end
end
