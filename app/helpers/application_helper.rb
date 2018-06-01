module ApplicationHelper
  def stock_color(i)
     case i <=> 0
     when 1  then 'text-danger'
     when -1 then 'text-success'
     end
  end
end
