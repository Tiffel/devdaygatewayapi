# Kubernetes Gateway API - moderner north/south Traffic“
ein 30 Minuten Votrag

## Zusammenfassung
In diesem Vortrag gebe ich eine Einführung in die Kubernetes Gateway API. Diese erlaubt auf moderne Weise HTTP- (und auch anderen) Traffic von außerhalb in einen K8S Cluster zu routen. Ein Vortrag für sowohl für Cluster Operator als auch Anwendungsentwickler, die verstehen wollen oder müssen, wie Sie Endpunkte exponieren.


## Beschreibung

Es ist lange bekannt, dass die Ingress Spec nicht ausreicht, um übliche Anwendungsfälle für HTTP Traffic abzubilden, sodass Controller Spezifische Annotationen verwendet werden. Zusätzlich wurde im November 2025 der Nginx Ingress Controller retired, sodass es sich anbietet, von Ingress API zu Gateway API zu migrieren. 

Nach einer kurzen Motivation geben wir eine Einführung in die API.  Wir schauen uns anhand einer Demo übliche und komplexere Anwendungsfälle an, um HTTP Traffic abzubilden. Einer davon ist die Integration mit Certmanager für automatisch erstellte TLS Zertifikate.

Nachdem die klassischen Ingress Anwendungsfälle abgedeckt sind, gehen wir auf Non-HTTP Traffic ein, der sich auch mittels der Gateway API exponieren lässt.

Außerdem gibt es  einen kurzen Ausblick in east/west Traffic mittels der "Gateway API for Service Mesh"



## Speaker Profil
Ich arbeite als Software Architekt in großen Projekten, in welchen Individualsoftware entwickelt wird. Getrieben durch Fachanforderungen unter Berücksichtigung der technischen und organisatorischen Rahmenbedingungen designe ich Systeme und begleite Umsetzungen.
Oft handelt es sich um fachlich und technisch hochkomplexe Brown Field Umgebungen, in denen die Evolution des existierenden Systems in eine moderne und neuen Anforderungen gewachsene Architektur das Ziel ist.
Dabei habe ich die langfristige Entwicklung des Systems im Blick, um den schmalen Grad zwischen künftiger Erweiterbarkeit und Geschwindigkeit der Umsetzung zu balancieren.

Neben meinem konkreten Projekteinsatz engagiere ich mich als Kernteam Mitglied im Technologie Board der Telekom MMS, welches als übergreifendes Expertengremium die Geschäftsleitung zur technischen Strategie der Telekom MMS berät. Außerdem coache ich andere Projekte und mache Architekturreviews.
