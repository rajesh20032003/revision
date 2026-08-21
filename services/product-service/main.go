package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

var products = []Product{
	{ID: 1, Name: "Keyboard", Price: 49.99, Stock: 25},
	{ID: 2, Name: "Mouse", Price: 19.99, Stock: 50},
	{ID: 3, Name: "Monitor", Price: 199.99, Stock: 10},
	{ID: 4, Name: "USB-C Hub", Price: 29.99, Stock: 40},
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "product-service"})
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	path := strings.TrimPrefix(r.URL.Path, "/products")
	path = strings.Trim(path, "/")

	if path == "" {
		json.NewEncoder(w).Encode(products)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid product id"})
		return
	}

	for _, p := range products {
		if p.ID == id {
			json.NewEncoder(w).Encode(p)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "product not found"})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/products", productsHandler)
	http.HandleFunc("/products/", productsHandler)

	log.Printf("product-service listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
