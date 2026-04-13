# Content Ideen
## Motivation

Ingress war schon immer Problematisch
Es ist lange bekannt, dass die Spec nicht ausreicht, deswegen immer spezifische Annotationen für den Controller
Was ist mit Non-HTTP Traffic?


Trigger: Ingress NGINX Retirement, November 11, 2025 https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/


https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
"The Kubernetes project recommends using Gateway instead of Ingress. The Ingress API has been frozen."
"The Kubernetes project has no plans to remove Ingress from Kubernetes."

GatewayAPi ist der empfohlende Weg, um north-south traffic (ouside cluster towards in the cluster) zu ermöglichen
Ersetzt Ingress vollständig und kann noch mehr.

Seit 2020 arbeitet die Sig an der Spec
Seit 2023 gibt es die 1.0.0
Seit Mitte 2024 gibt es funktionierende Implementierungen für Version 1.1.0
Seit November 2025 gibt es Druck zu migrieren.

## Personas
siehe https://gateway-api.sigs.k8s.io/
Isabell, die Infrastruktur Providerin. Isabell ist verantwortlich für eine Menge an Kubernetes Clustern und sorgt sich um alle, ohne einen einzelnen zu bevorzugen
Caroline, die Clusteroperatorin. Caroline ist verantwortlich für einen Kubernetes Cluster und stellt sicher, dass die Anforderungen der einzelnen Nutzer dieses Clusters erfüllt sind.
Christian, der Anwendungsentwickler. Christian baut Geschäftsanwendungen und will diese im Internet verfügbar machen.


## Schritt 1
Zeige für jede Persona, starten von Christian als Entwickler über Caroline und Isabell, was jeder einzelne im Context der Gateway API tun muss, um einen Service per HTTP zu exponieren.

## Schritt 2
Zeige für jede Persona, was nötig ist, um diesesn Service mit automatischen TLS Zertifikaten mittels Certmanager von Let's Encrpyt zu versehen

## Schritt 3
Zeige für jede Persona, was nötig ist, um einen Nicht HTTP Service wie MQTT zu exponieren

