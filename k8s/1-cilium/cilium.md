# cilium with gateway api support

https://docs.cilium.io/en/stable/installation/k8s-install-helm/
```
helm install cilium oci://quay.io/cilium/charts/cilium --values ciliumvalues.yaml --version 1.19.3 --namespace kube-system
helm upgrade cilium oci://quay.io/cilium/charts/cilium --values ciliumvalues.yaml--version 1.19.3 --namespace kube-system
```

## test

```
kubectl create ns cilium-test
kubectl label namespace cilium-test pod-security.kubernetes.io/enforce=privileged
kubectl apply -n cilium-test -f https://raw.githubusercontent.com/cilium/cilium/1.19.3/examples/kubernetes/connectivity-check/connectivity-check.yaml
kubectl get pods -n cilium-test

kubectl delete ns cilium-test
```