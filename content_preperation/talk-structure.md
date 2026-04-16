# Kubernetes Gateway API -- Moderner North/South Traffic
## Talk-Struktur und Inhalt (30 Minuten)

Basierend auf der Gateway API v1.5 Spezifikation.

---

## Folie 1: Titel
**Kubernetes Gateway API -- Moderner North/South Traffic**

- Speaker: Christian, Software Architekt, Telekom MMS
- Kontext: Einführung in die Kubernetes Gateway API v1.5
- Zielgruppe: Cluster-Operatoren und Anwendungsentwickler

---

## Teil 1: Motivation (~5 Minuten)

### Folie 2: Das Problem mit Ingress

**Die Ingress API ist eingefroren.**

Zitat von kubernetes.io:
> "The Kubernetes project recommends using Gateway instead of Ingress. The Ingress API has been frozen."
> "The Kubernetes project has no plans to remove Ingress from Kubernetes."

Kernprobleme:
- Die Ingress-Spec reicht nicht aus, um übliche HTTP Anwendungsfälle abzubilden -> Nutzung von Controller-spezifischen Annotationen
- Kein Support für Non-HTTP-Traffic (TCP/UDP, ...)

### Folie 3: Der Trigger -- Ingress-NGINX Retirement - rauslasse

**November 2025: Ingress-NGINX wird retired**
(Quelle: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)

- Der am weitesten verbreitete Ingress-Controller wird nicht mehr aktiv weiterentwickelt
- Jetzt ist der richtige Zeitpunkt, um zu migrieren
- Die Gateway API ist der offizielle Nachfolger

### Folie 4: Timeline der Gateway API - rauslasse

| Zeitpunkt | Ereignis |
|---|---|
| 2020 | SIG-Network startet die Arbeit an der Gateway API |
| Oktober 2023 | v1.0.0 -- HTTPRoute, Gateway, GatewayClass werden GA |
| Mai 2024 | v1.1.0 -- GRPCRoute GA, GAMMA (Mesh) GA |
| Mitte 2024 | Erste ausgereifte Implementierungen |
| November 2025 | Ingress-NGINX retired -- Migrationsdruck steigt |
| 2025/2026 | **v1.5** -- TLSRoute GA, ListenerSet GA, BackendTLSPolicy in v1, CORS, External Auth |

**Jetzt:** Die API ist ausgereift
Implementierungen für 1.5 sind noch rar.
1.4 ist verbreitet. cilium braucht noch einen hack für 1.5


---

## Teil 2: Das Konzept (~5 Minuten)

### Folie 5: Rollenorientiertes API-Design -- Personas

Die Gateway API definiert drei Personas mit klaren Verantwortlichkeiten:

| Persona | Rolle | Verantwortung |
|---|---|---|
| **Isabell** | Infrastruktur-Providerin | Stellt die Plattform bereit (z.B. Cloud-LB, Gateway-Controller). Verwaltet mehrere Cluster. |
| **Caroline** | Cluster-Operatorin | Betreibt einen einzelnen Cluster. Definiert Entry Points (Gateways), TLS, Policies. |
| **Christian** | Anwendungsentwickler | Baut Geschäftsanwendungen. Will seine Endpunkte exponieren, ohne sich um Infrastruktur zu kümmern. |

### Folie 6: Das Ressource-Modell

```
Isabell          Caroline               Christian
   |                 |                      |
GatewayClass --> Gateway (Listener) --> HTTPRoute --> Service
                                    --> GRPCRoute
                                    --> TLSRoute
                                    --> TCPRoute (exp.)
```

**Drei Schichten:**
1. **GatewayClass** (Cluster-scoped): Definiert den Gateway-Controller (z.B. Envoy, Nginx, Traefik, Istio, ...)
2. **Gateway**: Definiert Entry Points (Listener mit Port, Protokoll, Hostname, TLS)
3. **Routes**: Definieren Routing-Regeln, die an Gateway-Listener gebunden werden

**Schlüsselkonzepte:**
- Routes *attachen* sich an Gateways über `parentRefs`
- Cross-Namespace Routing ist möglich (mit `ReferenceGrant`)
- Mehrere Routes können sich einen Gateway teilen (Multi-Tenancy)
- Ein Route kann an mehrere Gateways attachen

### Folie 7: Route-Typen im Überblick (v1.5)

| Route | Protokoll | Layer | Status in v1.5 |
|---|---|---|---|
| **HTTPRoute** | HTTP/HTTPS | L7 | GA seit v0.5 |
| **GRPCRoute** | gRPC (HTTP/2) | L7 | GA seit v1.1 |
| **TLSRoute** | TLS (SNI-basiert) | L4-7 | **GA seit v1.5** |
| TCPRoute | TCP | L4 | Experimental |
| UDPRoute | UDP | L4 | Experimental |

---

## Teil 3: Demo Schritt 1 -- HTTP Service exponieren (~7 Minuten)
Gateway, route
### Gatewayclass ist die implementierung, die dafür sorgt, dass das gateway tut.
das macht Isabell, die die cluster verwaltet. 
dafür reicht ein clusteradmin nicht aus, weil es eben dinge drum herum braucht
Das legt fest, wie sich ein Gateway verhalten soll.

In meinem fall ist das ein Service
* Type ClusterIP (eigentlich nur intern)
* der pro listener einen port aufmacht.
* bei mir überhaupt nur erreichbar ist, weil cilium diese services ans hostnetwork exponiert
* in der cloud oft typ loadbalancer
* nodeport möglich.
* eine gatwayclass könnte noch ganz andere sachen tun, um einen port zu öffnen. z.b. ein SDN programmieren


### 
gateway stellt Caroline bereit. Diejenige, die auch Namespaces für die feature teams anlegt.
es ist also klar, wie der port nach außen aufgeht. im cluster geht es jetzt darum, wer ihn benutzen darf.

gründe für mehrere gateways: mehrere hostnames, einschränken auf namespaces.
meistens will man nur eins.


* rules und filters an HTTPRoute zeigen
* 


```
kubectl -n website port-forward svc/apple-service 5678:5678
http localhost:5678
```

```
kubectl get gatewayclass
kubectl describe gatewayclass cilium

```

## Teil 4: Demo Schritt 2 -- TLS mit cert-manager (~5 Minuten)

### Folie 13: TLS-Ziel

Ziel: `app.example.com` soll über HTTPS erreichbar sein, mit einem automatisch von Let's Encrypt erstellten Zertifikat via cert-manager.

### Folie 14: Carolines Aufgabe -- HTTPS Listener hinzufügen

Caroline erweitert das Gateway um einen HTTPS-Listener:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: shared-gateway
  namespace: infra
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  gatewayClassName: production
  listeners:
  - name: http
    port: 80
    protocol: HTTP
    hostname: "*.example.com"
    allowedRoutes:
      namespaces:
        from: Selector
        selector:
          matchLabels:
            gateway-access: "true"
  - name: https
    port: 443
    protocol: HTTPS
    hostname: "*.example.com"
    tls:
      mode: Terminate
      certificateRefs:
      - kind: Secret
        name: wildcard-example-com-tls
    allowedRoutes:
      namespaces:
        from: Selector
        selector:
          matchLabels:
            gateway-access: "true"
```

**Erklärung:**
- `protocol: HTTPS` mit `tls.mode: Terminate` -- TLS wird am Gateway terminiert
- `certificateRefs` referenziert ein Secret mit dem TLS-Zertifikat
- cert-manager erkennt die Annotation und erstellt das Zertifikat automatisch
- cert-manager unterstützt Gateway API nativ (kein Workaround nötig)

### Folie 15: Christians Aufgabe -- Route auf HTTPS umstellen

Christian passt seine Route an, um den HTTPS-Listener zu nutzen:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-route
  namespace: my-app-ns
spec:
  parentRefs:
  - name: shared-gateway
    namespace: infra
    sectionName: https
  hostnames:
  - app.example.com
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: my-app-service
      port: 8080
```

Einzige Änderung: `sectionName: https` statt `http`.

### Folie 16: Bonus -- HTTP-zu-HTTPS-Redirect

Caroline kann einen automatischen Redirect einrichten:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: https-redirect
  namespace: infra
spec:
  parentRefs:
  - name: shared-gateway
    sectionName: http
  hostnames:
  - "*.example.com"
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        port: 443
```

**Kein Annotationen-Hack** -- der Redirect ist ein nativer HTTPRoute-Filter.

### Folie 17: TLS-Konfiguration in der Gateway API

Überblick über TLS-Optionen in v1.5:

| Richtung | Konfiguration | Status v1.5 |
|---|---|---|
| **Downstream** (Client -> Gateway) | Listener `tls.mode: Terminate` | GA |
| **Downstream mTLS** (Client-Zertifikat) | `spec.tls.frontend.validation` | GA (Standard Channel) |
| **Upstream** (Gateway -> Backend) | `BackendTLSPolicy` | GA (v1) |
| **Upstream mTLS** (Gateway als Client) | `spec.tls.backend.clientCertificateRef` | GA (Standard Channel) |
| **Passthrough** | Listener `tls.mode: Passthrough` + TLSRoute | GA |

---

## Teil 5: Demo Schritt 3 -- Non-HTTP Traffic (~4 Minuten)

### Folie 18: Warum Non-HTTP?

- Nicht alle Anwendungen sprechen HTTP
- Beispiel: MQTT-Broker, Datenbank-Verbindungen, Custom-Protokolle über TCP
- Mit Ingress war das schlicht nicht möglich
- Die Gateway API unterstützt das nativ

### Folie 19: TLSRoute -- Neu GA in v1.5

Szenario: Ein MQTT-Broker soll unter `mqtt.example.com` erreichbar sein. MQTT läuft über TLS (Port 8883). Die TLS-Verbindung soll durchgereicht werden (Passthrough).

**Carolines Gateway-Erweiterung:**

```yaml
# Zusaetzlicher Listener am Gateway
- name: mqtt-tls
  port: 8883
  protocol: TLS
  hostname: mqtt.example.com
  tls:
    mode: Passthrough
  allowedRoutes:
    kinds:
    - kind: TLSRoute
    namespaces:
      from: Selector
      selector:
        matchLabels:
          gateway-access: "true"
```

**Christians TLSRoute:**

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: TLSRoute
metadata:
  name: mqtt-route
  namespace: iot-ns
spec:
  parentRefs:
  - name: shared-gateway
    namespace: infra
    sectionName: mqtt-tls
  hostnames:
  - mqtt.example.com
  rules:
  - backendRefs:
    - name: mqtt-broker
      port: 8883
```

**Erklärung:**
- TLSRoute routet basierend auf SNI (Server Name Indication)
- `Passthrough` -- die TLS-Verbindung wird nicht am Gateway terminiert
- Der MQTT-Broker selbst terminiert TLS
- **Neu in v1.5:** TLSRoute ist jetzt GA und Teil des Standard Channel

### Folie 20: TCPRoute -- Experimental

Für reines TCP-Forwarding (ohne TLS/SNI):

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: TCPRoute
metadata:
  name: tcp-db-route
  namespace: data-ns
spec:
  parentRefs:
  - name: shared-gateway
    namespace: infra
    sectionName: db-tcp
  rules:
  - backendRefs:
    - name: database-service
      port: 5432
```

**Hinweis:**
- TCPRoute ist weiterhin experimental (`v1alpha2`)
- Kein Routing-Discriminator -- jeder TCP-Port braucht einen eigenen Listener
- Für UDPRoute gilt dasselbe

---

## Teil 6: Ausblick -- Service Mesh & Weitere v1.5 Features (~2 Minuten)

### Folie 21: Gateway API for Service Mesh (GAMMA)

Die Gateway API ist nicht nur für North/South Traffic:

```
North/South (Ingress):      Route --> Gateway --> Extern
East/West (Mesh):           Route --> Service --> Service
```

- Seit v1.1 ist GAMMA (Gateway API for Mesh Management and Administration) GA
- Routes attachen direkt an einen Service statt an ein Gateway:

```yaml
kind: HTTPRoute
spec:
  parentRefs:
  - name: my-service
    kind: Service
    group: core
    port: 80
  rules:
    - matches:
      - path:
          type: PathPrefix
          value: /v2
      backendRefs:
      - name: my-service-v2
        port: 80
```

- Gleiche API-Konzepte (HTTPRoute, Matching, Filtering) für internen Traffic
- Unterstützt von Istio, Linkerd und anderen Mesh-Implementierungen

### Folie 22: Weitere spannende v1.5 Features

| Feature | Beschreibung |
|---|---|
| **ListenerSet** (GA) | Erlaubt dezentrales Hinzufügen von Listenern zu einem Gateway. Caroline kann Listener an andere Teams delegieren. Skaliert über das 64-Listener-Limit eines einzelnen Gateways hinaus. |
| **BackendTrafficPolicy** | Timeouts, Retries, Health Checks und Session Persistence als eigene Ressource. |
| **CORS-Filter** | Nativer CORS-Support als HTTPRoute-Filter -- keine Annotationen mehr nötig. |
| **External Auth Filter** | Externe Authentifizierung als nativer HTTPRoute-Filter. |

---

## Teil 7: Zusammenfassung & Takeaways (~2 Minuten)

### Folie 23: Migration jetzt starten

**Warum jetzt?**
1. Die Ingress API ist eingefroren -- es kommen keine neuen Features
2. Ingress-NGINX ist retired
3. Die Gateway API v1.5 ist ausgereift: HTTPRoute, GRPCRoute, TLSRoute, BackendTLSPolicy -- alles GA
4. Tooling ist vorhanden: `ingress2gateway` für automatische Konvertierung

**Migration in drei Schritten:**
1. Gateway-Controller installieren (z.B. Envoy Gateway, Nginx Gateway Fabric, Traefik, ...)
2. Gateway + HTTPRoutes erstellen
3. Ingress-Ressourcen sukzessive ablösen

### Folie 24: Zusammenfassung

| | Ingress | Gateway API v1.5 |
|---|---|---|
| Berechtigungsmodell | Flach | Rollenorientiert (3 Personas) |
| HTTP-Routing | Basis + Annotationen | Umfangreiche native Features |
| TLS | Einfache Terminierung | Terminate, Passthrough, mTLS (beidseitig), BackendTLSPolicy |
| Non-HTTP | Nicht möglich | TLSRoute (GA), TCPRoute, UDPRoute (exp.) |
| Erweiterbarkeit | Annotationen | Policy Attachment, Extension Refs |
| Service Mesh | Nicht vorgesehen | GAMMA (GA seit v1.1) |
| Multi-Tenancy | Schwierig | Natives Cross-Namespace-Routing |

### Folie 25: Ressourcen

- Gateway API Dokumentation: https://gateway-api.sigs.k8s.io/
- Migration Guide: https://gateway-api.sigs.k8s.io/guides/getting-started/migrating-from-ingress/
- Ingress-NGINX Migration: https://gateway-api.sigs.k8s.io/guides/getting-started/migrating-from-ingress-nginx/
- ingress2gateway Tool: https://github.com/kubernetes-sigs/ingress2gateway
- Implementierungen im Vergleich (v1.5): https://gateway-api.sigs.k8s.io/implementations/v1.5/
- cert-manager Gateway API Support: https://cert-manager.io/docs/usage/gateway/

---

## Zeitplanung

| Teil | Thema | Dauer |
|---|---|---|
| 1 | Motivation (Ingress-Probleme, NGINX Retirement, Timeline) | ~5 min |
| 2 | Konzept (Personas, Ressource-Modell, Route-Typen) | ~5 min |
| 3 | Demo: HTTP exponieren (GatewayClass, Gateway, HTTPRoute) | ~7 min |
| 4 | Demo: TLS mit cert-manager (HTTPS, Redirect) | ~5 min |
| 5 | Demo: Non-HTTP Traffic (TLSRoute GA, TCPRoute) | ~4 min |
| 6 | Ausblick: Service Mesh & v1.5 Features | ~2 min |
| 7 | Zusammenfassung & Takeaways | ~2 min |
| **Gesamt** | | **~30 min** |

---

## Hinweise für die Demo-Vorbereitung

### Cluster-Setup
- Ein lokaler Kubernetes-Cluster (z.B. kind, k3d) reicht für die Demo
- Gateway-Controller nach Wahl installieren
- cert-manager installieren
- Optional: MQTT-Broker (z.B. Eclipse Mosquitto) als Beispiel-Workload für den TLSRoute-Schritt

### Roter Faden
- Jeder Demo-Schritt baut auf dem vorherigen auf
- Immer zeigen: Wer (Persona) macht was (Ressource)
- `kubectl get gateways`, `kubectl get httproutes`, `kubectl describe` für Status zeigen
- Besonders die Status-Conditions hervorheben (Accepted, Programmed, ResolvedRefs)

### Storytelling
- Christian (der Entwickler) ist die Hauptfigur -- das Publikum identifiziert sich mit ihm
- Beginne bei Christian: "Ich will meinen Service exponieren, was muss ich tun?"
- Dann erkläre rückwärts: "Damit das funktioniert, muss Caroline ein Gateway bereitstellen"
- Und noch weiter zurück: "Caroline braucht eine GatewayClass von Isabell"
- In der Demo dann vorwärts: Isabell -> Caroline -> Christian
