class AddTableAssociation < ActiveRecord::Migration[5.1]
  def change
    add_column :histories, :stocklist_id, :integer
    add_index(:histories, [:date, :stocklist_id], {:unique => true})
    #add_column :tradedays, :stocklist_id, :integer
    #add_column :realtimes, :tradeday_id, :integer
  end
end
