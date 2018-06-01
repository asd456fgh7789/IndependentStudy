class CreateStocklists < ActiveRecord::Migration[5.1]
  def change
    create_table :stocklists do |t|
      t.string  :symbol, null:false
      t.string  :name
      t.string  :isin
      t.date    :listed
      t.string  :tse_otc
      t.string  :industry
      t.string  :cfi
      t.text    :note
      t.timestamps
    end
  end
end
