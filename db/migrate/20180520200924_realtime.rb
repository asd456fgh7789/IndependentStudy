class Realtime < ActiveRecord::Migration[5.1]
  def change
    create_table :realtime do |t|
      t.date    :date, null:false
      t.integer :share
      t.float   :price
      t.float   :open
      t.float   :high
      t.float   :low
      t.float   :close
      t.integer :stocklist_id
    end
    add_index(:realtime, [:date, :stocklist_id], {:unique => true})
  end
end
