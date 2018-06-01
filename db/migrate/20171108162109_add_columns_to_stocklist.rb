class AddColumnsToStocklist < ActiveRecord::Migration[5.1]
  def change
    add_column :stocklists, :share, :integer
    add_column :stocklists, :price, :float
    add_column :stocklists, :open, :float
    add_column :stocklists, :high, :float
    add_column :stocklists, :low, :float
    add_column :stocklists, :close, :float
    add_column :stocklists, :last_close, :float
    add_column :stocklists, :diff, :float
    add_column :stocklists, :volume, :integer
  end
end
