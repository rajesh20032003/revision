{{/* define standard labels used across all resources */}}

{{- define "my-shop-cart.labels" -}}
app.kubernetes.io/name: {{ .Values.product_service.name | default "product-service" }}
{{- end -}}