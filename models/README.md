# Modèles ML (Baby Cry)

Placez ici le fichier ONNX exporté après entraînement :

- **baby_cry_efficientnet_b0.onnx** — modèle de détection des pleurs (binaire + type + intensité)

Sans ce fichier, l’API `/baby-cry/analyze` fonctionne en mode **stub** (résultat simulé).

Export depuis le projet ML :

```bash
# Depuis ml/
cp models/baby_cry_efficientnet_b0.onnx ../backend-sensbridge-pim/models/
```

Puis redémarrer le backend. Les statistiques de normalisation (mean/std) sont dans `src/baby-cry/audio-preprocess.ts` (PREPROCESSING_CONFIG) ; les mettre à jour si besoin après entraînement.
