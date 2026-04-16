## Kubernetes Gateway API -- Moderner North/South Traffic


---
## Kubernetes Gateway API -- Moderner North/South Traffic

whoami

Christian, Software Architekt, Telekom MMS

---
## Motivation - Das Problem mit Ingress

**Die Ingress API ist eingefroren.**

> "The Kubernetes project recommends using Gateway instead of Ingress. The Ingress API has been frozen."
> "The Kubernetes project has no plans to remove Ingress from Kubernetes."

Kernprobleme:
- Die Ingress-Spec reicht nicht aus, um übliche HTTP Anwendungsfälle abzubilden -> Nutzung von Controller-spezifischen Annotationen
- Kein Support für Non-HTTP-Traffic (TCP/UDP, ...)

----

### Folie 5: Rollenorientiertes API-Design -- Personas

Die Gateway API definiert drei Personas mit klaren Verantwortlichkeiten:

| Persona | Rolle | Verantwortung |
|---|---|---|
| **Isabell** | Infrastruktur-Providerin | Stellt die Plattform bereit (z.B. Cloud-LB, Gateway-Controller). Verwaltet mehrere Cluster. |
| **Caroline** | Cluster-Operatorin | Betreibt einen einzelnen Cluster. Definiert Entry Points (Gateways), TLS, Policies. |
| **Christian** | Anwendungsentwickler | Baut Geschäftsanwendungen. Will seine Endpunkte exponieren, ohne sich um Infrastruktur zu kümmern. |