require "sinatra"
require "net/http"
require "json"
require "securerandom"

set :bind, "0.0.0.0"
set :port, ENV.fetch("PORT", 8080)
set :host_authorization, { permitted_hosts: [] }

USER_SERVICE_URL = ENV.fetch("USER_SERVICE_URL", "http://localhost:8082")
CART_SERVICE_URL = ENV.fetch("CART_SERVICE_URL", "http://localhost:8083")

orders = {}

def fetch_json(url)
  uri = URI(url)
  res = Net::HTTP.get_response(uri)
  return nil unless res.is_a?(Net::HTTPSuccess)
  JSON.parse(res.body)
end

get "/health" do
  content_type :json
  { status: "ok", service: "order-service" }.to_json
end

get "/orders" do
  content_type :json
  orders.values.to_json
end

post "/orders" do
  content_type :json
  body = JSON.parse(request.body.read) rescue {}
  user_id = body["userId"]
  halt 400, { error: "userId is required" }.to_json unless user_id

  user = fetch_json("#{USER_SERVICE_URL}/users/#{user_id}")
  halt 404, { error: "user not found" }.to_json unless user

  cart = fetch_json("#{CART_SERVICE_URL}/carts/#{user_id}")
  cart ||= []
  halt 400, { error: "cart is empty" }.to_json if cart.empty?

  total = cart.sum { |item| item["price"].to_f * item["quantity"].to_i }
  order_id = SecureRandom.uuid

  order = {
    id: order_id,
    user: user,
    items: cart,
    total: total.round(2),
    status: "confirmed"
  }
  orders[order_id] = order

  status 201
  order.to_json
end

get "/orders/:id" do
  content_type :json
  order = orders[params["id"]]
  halt 404, { error: "orders not found" }.to_json unless order
  order.to_json
end
