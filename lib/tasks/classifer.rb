require 'pycall/import'

include PyCall::Import

# 將分類器封裝比較好操作
class DiffClassifier
  def initialize(data, y_col, date, days)
    raise ArgumentError if data.size < days + 1
    @data = data.transpose
    @data[0].map!.with_index{|e, i| e = i}
    @y_col = y_col
    @date = date
    @days = days
  end

  def predict()
    pyfrom :sklearn, import: :linear_model
    y_data = @data.delete_at(@y_col).map {|i| i >= 0 ? true : false}
    x_data = @data.transpose
    train_y, pred_y = y_data.partition.with_index { |r, i| i < @days }
    train_x, pred_x = x_data.partition.with_index { |r, i| i < @days }

    reg = linear_model.LogisticRegression.new()
    reg.fit(train_x, train_y)
    [reg.predict(pred_x)[0], pred_y[0], reg.score(train_x, train_y).round(3)]
  end
end