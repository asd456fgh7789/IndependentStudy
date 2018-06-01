# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180520200924) do

  create_table "histories", force: :cascade do |t|
    t.date "date", null: false
    t.integer "share"
    t.float "price"
    t.float "open"
    t.float "high"
    t.float "low"
    t.float "close"
    t.float "diff"
    t.integer "volume"
    t.float "sma_15"
    t.float "ema_15"
    t.float "rsi_15"
    t.float "macd_15"
    t.float "pK_9"
    t.float "pD_9"
    t.float "atr"
    t.float "dmi"
    t.float "adx"
    t.float "ema_5"
    t.float "rsi"
    t.float "macd"
    t.boolean "predict"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "stocklist_id"
    t.index ["date", "stocklist_id"], name: "index_histories_on_date_and_stocklist_id", unique: true
  end

  create_table "realtime", force: :cascade do |t|
    t.date "date", null: false
    t.integer "share"
    t.float "price"
    t.float "open"
    t.float "high"
    t.float "low"
    t.float "close"
    t.integer "stocklist_id"
    t.index ["date", "stocklist_id"], name: "index_realtime_on_date_and_stocklist_id", unique: true
  end

  create_table "stocklists", force: :cascade do |t|
    t.string "symbol", null: false
    t.string "name"
    t.string "isin"
    t.date "listed"
    t.string "tse_otc"
    t.string "industry"
    t.string "cfi"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "share"
    t.float "price"
    t.float "open"
    t.float "high"
    t.float "low"
    t.float "close"
    t.float "last_close"
    t.float "diff"
    t.integer "volume"
    t.index ["symbol"], name: "index_stocklists_on_symbol", unique: true
  end

end
