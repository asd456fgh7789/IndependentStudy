Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to:"stock#index"
  resources :info
  get 'stock/info' => 'stock#info'
  
  get 'stock/list' => 'stock#list' , :defaults => { :format => 'json' }
  get 'stock/history' => 'stock#history', :defaults => { :format => 'json' }
end