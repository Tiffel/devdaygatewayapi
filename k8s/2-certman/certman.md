# certman
```
helm install cert-manager oci://quay.io/jetstack/charts/cert-manager --version v1.20.2 --create-namespace --namespace cert-manager --values certmanvalues.yaml
```

### remove
```
helm delete cert-manager --namespace cert-manager

kubectl delete crd \
  issuers.cert-manager.io \
  clusterissuers.cert-manager.io \
  certificates.cert-manager.io \
  certificaterequests.cert-manager.io \
  orders.acme.cert-manager.io \
  challenges.acme.cert-manager.io

```