## Kubernetes Gateway API 
## Moderner North/South Traffic

```
➜  ~ whoami
Christian, Software Architekt, Telekom MMS
```


---
## Motivation

> "The Kubernetes project recommends using Gateway instead of Ingress. The Ingress API has been frozen."
> 
> "The Kubernetes project has no plans to remove Ingress from Kubernetes."

### Probleme
- Die Ingress-Spec reicht nicht aus, um übliche HTTP Anwendungsfälle abzubilden
- Nutzung von Controller-spezifischen Annotationen als Mitigation
- Kein Support für Non-HTTP-Traffic (TCP/UDP, ...)

---

### Rollenorientiertes API-Design

Die Gateway API definiert drei Personas mit Verantwortlichkeiten

| Persona | Rolle | Verantwortung                                                                                      |
|---|---|----------------------------------------------------------------------------------------------------|
| **Isabell** | Infrastruktur-Providerin | Stellt die Plattform bereit (z.B. Loadbalancer, GatewayClass). Verwaltet mehrere Cluster.          |
| **Caroline** | Cluster-Operatorin | Betreibt einen einzelnen Cluster. Definiert Entry Points (Gateways), TLS, Policies.                |
| **Christian** | Anwendungsentwickler | Baut Geschäftsanwendungen. Will seine Endpunkte exponieren, ohne sich um Infrastruktur zu kümmern. |

---
### Ressourcen

<img src="resource-model.png" width="500">

### Drei Schichten
* **GatewayClass** (Cluster-scoped): Definiert den Gateway-Controller (z.B. Envoy, Nginx, Traefik, Istio, ...)
* **Gateway**: Definiert Entry Points (Listener mit Port, Protokoll, Hostname, TLS)
* **Routes**: Definieren Routing-Regeln, die an Gateway-Listener gebunden werden

---

### Ressourcen

```
Isabell          Caroline               Christian
   |                 |                      |
GatewayClass --> Gateway (Listener) --> HTTPRoute --> Service
                                    --> GRPCRoute
                                    --> TLSRoute
                                    --> TCPRoute
```

### Schlüsselkonzepte
- Routes attachen sich an Gateways
- Mehrere Routes können sich einen Gateway teilen (Multi-Tenancy)
- Ein Route kann an mehrere Gateways attachen

---

### Route-Typen im Überblick (v1.5)

| Route | Protokoll | Layer | Status in v1.5 |
|---|---|---|---|
| **HTTPRoute** | HTTP/HTTPS | L7 | GA seit v0.5 |
| **GRPCRoute** | gRPC (HTTP/2) | L7 | GA seit v1.1 |
| **TLSRoute** | TLS (SNI-basiert) | L4-7 | GA seit v1.5 |
| TCPRoute | TCP | L4 | Experimental |
| UDPRoute | UDP | L4 | Experimental |

---

## Demo
### HTTP Service exponieren

----
## Demo
### HTTP Service exponieren
#### workload

```
kubectl -n pets get services
kubectl -n pets port-forward svc/cats-service 5678:5678
http localhost:5678
```

#### GatewayClass
```
kubectl get gatewayclass
kubectl describe gatewayclass cilium

kubectl -n gateway get gateway
kubectl -n gateway get services 
```
listeners must be distinct!

#### Route

```
http 192.168.178.101:80/cat
http 192.168.178.101:80/cat Host:pets.devday.cscheer.eu
http pets.devday.cscheer.eu/cat 
http POST pets.devday.cscheer.eu/dog
http pets.devday.cscheer.eu/any
watch -n 1 http pets.devday.cscheer.eu/any
```

---

## Demo
### TLS mit cert-manager

----


```
kubectl -n gateway get Certificate
```
---

## ListenerSet

https://gateway-api.sigs.k8s.io/guides/listener-set/

---

## Ausblick
TlSRoute
Tcp/Udp Route
GAMMA Initiative (Gateway API for Service Mesh)¶


## Links
- Gateway API Dokumentation: https://gateway-api.sigs.k8s.io/
- Implementierungen im Vergleich (v1.5): https://gateway-api.sigs.k8s.io/implementations/v1.5/
- cert-manager Gateway API Support: https://cert-manager.io/docs/usage/gateway/
- cilium Gateway API Support: https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/


## this
https://github.com/Tiffel/devdaygatewayapi
<img src="qrcode.png" width="500">
