class AddIndexOnStocklists < ActiveRecord::Migration[5.1]
  def change
    add_index :stocklists, :symbol, {unique:true}
  end
end
