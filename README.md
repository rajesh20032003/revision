# Polyglot Microservices Monorepo

A small, working 5-service app for practicing Docker, Helm, Kubernetes, and Istio.

## Architecture

```
                     ┌─────────────┐
        browser ───► │   gateway   │  (Node.js, serves UI + aggregates)
                     └──────┬──────┘
              ┌─────────────┼─────────────┬──────────────┐
              ▼             ▼             ▼              ▼
      product-service  user-service  cart-service   order-service
         (Go)            (Python)      (Node.js)      (Ruby)
                                            │              │
                                            └──► calls ────┘
                                          product-service   user-service
                                                             cart-service
```

- **product-service** (Go) — in-memory product catalog: `GET /products`, `GET /products/:id`
- **user-service** (Python/FastAPI) — in-memory users: `GET /users`, `GET /users/:id`, `POST /users`
- **cart-service** (Node/Express) — per-user cart, validates items against product-service
- **order-service** (Ruby/Sinatra) — checks out a cart: calls user-service + cart-service, computes total
- **gateway** (Node/Express) — serves a tiny HTML frontend and proxies `/api/*` to the above

Every service exposes `GET /health` for liveness/readiness probes.

## Run locally with Docker Compose

```bash
cd monorepo
docker compose up --build
```

Then open http://localhost:8080 — you'll see product list, service status, and can add to cart / checkout.

## Practice roadmap

1. **Docker** (done above) — build each Dockerfile individually too:
   `docker build -t product-service ./services/product-service`

2. **Kubernetes** — plain manifests are in `k8s/`. Build images, load them into your local
   cluster (e.g. `kind load docker-image product-service:latest` or `minikube image load ...`),
   then:
   ```bash
   kubectl apply -f k8s/
   kubectl -n shop get pods
   kubectl -n shop port-forward svc/gateway 8080:8080
   ```

3. **Helm** — `helm/product-service` is a starter chart. Install it:
   ```bash
   helm install product-service ./helm/product-service
   ```
   Then copy that pattern to create charts for the other 4 services (or turn this into
   an umbrella chart with subcharts — good next exercise).

4. **Istio** — once everything runs on plain k8s Services:
   - Enable sidecar injection on the `shop` namespace (already labeled `istio-injection: enabled`
     in `k8s/00-namespace.yaml`).
   - Add a `Gateway` + `VirtualService` to expose `gateway` through the Istio ingress instead
     of `type: LoadBalancer`.
   - Add `DestinationRule`s per service, then practice traffic shifting (e.g. canary a v2 of
     product-service), retries/timeouts, and mTLS (`PeerAuthentication`).
   - `istioctl analyze -n shop` and `kiali` are good tools to inspect the mesh once traffic
     is flowing.

## Local ports (docker-compose)

| service         | port |
|-----------------|------|
| gateway          | 8080 |
| product-service  | 8081 |
| user-service     | 8082 |
| cart-service     | 8083 |
| order-service    | 8084 |

## Notes

- All state is in-memory — restarting a service resets its data. Good enough for practicing
  infra; swap in a real DB later if you want to practice StatefulSets/PVCs too.
- Services are intentionally small (~50-150 lines) so you can focus on the infra, not the app logic.
