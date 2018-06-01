class CreateRealtimes < ActiveRecord::Migration[5.1]
  def change
    create_table :realtimes do |t|
      t.time    :time, null:false
      t.float   :price
      t.integer :volume
      t.integer :total_vol
      t.string  :ask_price
      t.string  :ask_vol
      t.string  :bid_price
      t.string  :bod_vol
      t.timestamps
    end
  end
end
