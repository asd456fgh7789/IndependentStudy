module TechAnalysis
  def self.sma(data, days = 5)
    arr = Array.new(data.size)
    arr[days - 1] = data[0...days].reduce(&:+) / days
    (days...data.size).each do |i|
      arr[i] = arr[i - 1] + (data[i] - data[i - days]).to_f / days
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.ema(data, days = 5)
    return nil unless check(data, days)
    arr = Array.new(data.size)
    alpha = 2.0 / (days + 1)
    arr[0] = data[0]
    (1...data.size).each do |i|
      arr[i] = arr[i - 1] + alpha * (data[i] - arr[i - 1])
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.kd(data, high, low, days = 9)
    return nil unless check(data, days)
    arr = Array.new(data.size)
    (days...data.size).each do |i|
      hi = high[i - days..i].max
      lo = low[i - days..i].min
      rsv = (data[i] - lo) / (hi - lo)
      alpha = 1.0 / 3
      arr[i] = [
        k = alpha * rsv + (1 - alpha) * ((arr[i - 1].nil?) ? 0.5 : arr[i - 1][0]),
        alpha * k + (1 - alpha) * ((arr[i - 1].nil?) ? 0.5 : arr[i - 1][1])
      ]
    end
    arr.map {|i| i ? i.map! {|j| j.round(3) } : i = Array.new(2) }
  end

  def self.rsi(data, days = 14)
    return nil unless check(data, days)
    diff = Array.new(data.size, 0)
    arr = Array.new(data.size)
    (1...data.size).each { |i| diff[i] = (data[i] - data[i - 1]) }
    diff.map {|i| i.round(3) if i }

    (days...data.size).each do |i|
      gain, loss = diff[i - days..i].partition { |v| v >= 0 }
      avg_gain = (gain << 0).reduce(&:+) / days
      avg_loss = (loss << 0).reduce(&:+).abs / days
      rs = avg_gain / avg_loss
      arr[i] = 100 - 100 / (1 + rs)
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.macd(data, days = 9)
    return nil unless check(data, days)
    dif = ema(data, 12).zip(ema(data, 26)).map! {|i| i.reduce(&:-).round(3)}
    dem = ema(data, days)
    arr = Array.new(data.size)
    (0...data.size).each do |i|
      arr[i] = dif[i] - dem[i]
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.stdev(data, days)
    return nil unless check(data, days)
    arr = Array.new(data.size)
    (days...data.size).each do |i|
      d = data[i - days...i].dup
      mean = d.reduce(&:+) / days
      square = d.map {|v| v**2 }
      var = square.reduce(&:+) / days - mean**2
      arr[i] = Math.sqrt(var)
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.atr(close, high, low, days)
    return nil unless check(close, days) && check(high, days) && check(low, days)
    arr = Array.new(close.size, nil)
    (1...close.size).each do |i|
      arr[i] = [close[i - 1], high[i]].max - [close[i - 1], low[i]].min
    end
    ema(arr, days)
  end

  def self.dmi(close, high, low, days = 14)
    return nil unless check(close, days) && check(high, days) && check(low, days)
    tr = Array.new(close.size, 0)
    p_dm = tr.map.with_index { |v, i| v = i > 0 ? (high[i] - high[i - 1]).round(3) : 0 }
    n_dm = tr.map.with_index { |v, i| v = i > 0 ? (low[i - 1] - low[i]).round(3) : 0 }

    (1...close.size).each do |i|
      tr[i] = [high[i] - low[i], high[i] - close[i], low[i] - close[i]].max.round(3)
      p_dm[i] = (p_dm[i] > n_dm[i].abs) && p_dm[i] > 0 ? p_dm[i] : 0
      n_dm[i] = (p_dm[i].abs < n_dm[i]) && n_dm[i] > 0 ? n_dm[i] : 0
    end
    #trd = tr.dup
    tr = sma(tr, days)
    #p_dmd = p_dm.dup
    #n_dmd = n_dm.dup
    p_dm = sma(p_dm, days)
    n_dm = sma(n_dm, days)

    arr = Array.new(close.size, nil)
    (days...close.size).each do |i|
      p_di = (p_dm[i] / tr[i]).round(3)
      n_di = (n_dm[i] / tr[i]).round(3)
      arr[i] = (p_di - n_di).abs / (p_di + n_di)
      #p [[high[i-1], high[i]], [low[i-1], low[i]],[close[i-1], close[i]],trd[i], p_dmd[i], n_dmd[i], tr[i], p_dm[i], n_dm[i], i] if arr[i].nan?
      #p [p_dm[i], n_dm[i], arr[i], p_di, n_di, arr[i]]
    end
    arr.map {|i| i.round(3) if i }
  end

  def self.adx(close, high, low, days = 14)
    arr = dmi(close, high, low, days)
    arr = arr[0...days] + sma(arr[days..-1], days)
    arr
  end

  private
  def self.check(data, days)
    return nil unless data.is_a? Array
    return nil if data.size < days
    data.map!(&:to_f)
  end
end

# hi = [[33.65], [33.8], [33.7], [33.75], [33.7], [33.6], [33.65], [33.7], [33.7], [33.75], [34.95], [34.85], [34.75], [34.8], [34.55], [34.7], [34.85], [34.75], [34.6], [34.25], [34.0], [33.95], [33.9], [33.95], [33.95], [34.65], [34.15], [34.05], [34.1], [34.1], [34.1], [34.2], [34.1], [34.1], [34.6], [34.7], [34.7], [35.3], [36.25], [36.5], [36.45], [36.25], [36.8]].flatten!
# lo = [[33.5], [33.6], [33.6], [33.5], [33.4], [33.4], [33.45], [33.35], [33.5], [33.55], [33.95], [34.25], [34.5], [34.2], [34.25], [34.3], [34.35], [34.35], [34.25], [33.6], [33.65], [33.55], [33.55], [33.55], [33.6], [33.8], [33.85], [33.7], [33.7], [33.7], [33.8], [34.05], [33.65], [33.85], [34.0], [34.35], [34.45], [34.5], [35.1], [35.95], [36.0], [36.0], [36.1]].flatten!
# arr = [[33.6], [33.6], [33.7], [33.7], [33.4], [33.5], [33.5], [33.55], [33.65], [33.65], [34.7], [34.3], [34.65], [34.2], [34.35], [34.7], [34.5], [34.55], [34.4], [33.6], [33.9], [33.55], [33.7], [33.95], [33.95], [33.8], [33.9], [33.8], [34.1], [33.9], [34.1], [34.1], [34.0], [34.1], [34.45], [34.55], [34.55], [35.15], [36.15], [36.4], [36.2], [36.2], [36.45]].flatten!
# 
# p TechAnalysis.macd(arr, 9)