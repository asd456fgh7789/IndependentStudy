class CreateHistories < ActiveRecord::Migration[5.1]
  def change
    create_table :histories do |t|
      t.date    :date, null:false
      t.integer :share
      t.float   :price
      t.float   :open
      t.float   :high
      t.float   :low
      t.float   :close
      t.float   :diff
      t.integer :volume
      t.float   :sma_15
      t.float   :ema_15
      t.float   :rsi_15
      t.float   :macd_15
      t.float   :pK_9
      t.float   :pD_9
      t.float   :atr
      t.float   :dmi
      t.float   :adx
      t.float   :ema_5
      t.float   :rsi
      t.float   :macd
      t.boolean :predict
      t.timestamps
    end
    
  end
end
