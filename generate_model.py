"""Generate explicitly synthetic ASTRA-VITAL sensor scenarios and train a demo classifier.

This model learns labels assigned by a synthetic scenario generator. It is NOT a
clinical model and must not be used for real astronaut or patient decisions.
"""
from __future__ import annotations
import json, csv, hashlib
from pathlib import Path
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score

ROOT = Path(__file__).resolve().parent
RNG_SEED = 24062026
FEATURES = [
    "heart_rate_bpm", "spo2_pct", "resp_rate_min", "temperature_c",
    "sleep_hours", "fatigue_1_5", "mood_1_5", "dizziness_0_1",
    "breathlessness_0_1", "nausea_0_1"
]
CLASSES = ["routine_pattern", "review_pattern", "priority_review_pattern"]
DISPLAY = ["Routine-like pattern", "Review pattern", "Priority review pattern"]

rng = np.random.default_rng(RNG_SEED)

# All distributions below are invented solely for software demonstration.
# They are not NASA values, validated astronaut norms, or medical thresholds.
def clip(x, lo, hi):
    return np.clip(x, lo, hi)

def make_profile(label: int, n: int):
    # Latent scenario intensity creates correlated, non-independent signals.
    if label == 0:
        intensity = rng.beta(1.5, 7.0, n)
        hr = rng.normal(66 + 13*intensity, 7.5, n)
        spo2 = rng.normal(98.1 - 1.0*intensity, 1.0, n)
        rr = rng.normal(15.0 + 3.0*intensity, 2.2, n)
        temp = rng.normal(36.7 + 0.25*intensity, 0.25, n)
        sleep = rng.normal(7.6 - 0.8*intensity, 0.75, n)
        fatigue = rng.normal(1.7 + 0.8*intensity, 0.65, n)
        mood = rng.normal(4.1 - 0.7*intensity, 0.55, n)
        p_diz, p_breath, p_nausea = 0.035 + 0.04*intensity, 0.015, 0.035
    elif label == 1:
        intensity = rng.beta(2.1, 2.8, n)
        hr = rng.normal(73 + 23*intensity, 10.5, n)
        spo2 = rng.normal(97.0 - 4.2*intensity, 1.8, n)
        rr = rng.normal(16.5 + 7.0*intensity, 3.2, n)
        temp = rng.normal(36.8 + 0.75*intensity, 0.35, n)
        sleep = rng.normal(7.1 - 2.0*intensity, 1.0, n)
        fatigue = rng.normal(2.2 + 1.65*intensity, 0.75, n)
        mood = rng.normal(3.8 - 1.55*intensity, 0.75, n)
        p_diz, p_breath, p_nausea = 0.10 + 0.20*intensity, 0.04 + 0.15*intensity, 0.08 + 0.15*intensity
    else:
        intensity = rng.beta(4.0, 1.5, n)
        hr = rng.normal(86 + 32*intensity, 13.0, n)
        spo2 = rng.normal(95.0 - 8.0*intensity, 2.5, n)
        rr = rng.normal(19.0 + 10.0*intensity, 4.0, n)
        temp = rng.normal(37.0 + 1.2*intensity, 0.50, n)
        sleep = rng.normal(6.2 - 2.2*intensity, 1.2, n)
        fatigue = rng.normal(2.8 + 1.75*intensity, 0.70, n)
        mood = rng.normal(3.1 - 1.55*intensity, 0.85, n)
        p_diz, p_breath, p_nausea = 0.22 + 0.30*intensity, 0.18 + 0.42*intensity, 0.18 + 0.30*intensity

    # Add sensor noise, missingness is not injected in training (data quality is handled separately).
    arr = np.column_stack([
        clip(hr, 38, 160), clip(spo2, 78, 100), clip(rr, 7, 40), clip(temp, 34.5, 40.5),
        clip(sleep, 0, 12), clip(fatigue, 1, 5), clip(mood, 1, 5),
        rng.binomial(1, np.clip(p_diz, 0, .9), size=n),
        rng.binomial(1, np.clip(p_breath, 0, .9), size=n),
        rng.binomial(1, np.clip(p_nausea, 0, .9), size=n),
    ])
    return arr

per_class = 6000
X_parts, y_parts = [], []
for cls in range(3):
    X_parts.append(make_profile(cls, per_class))
    y_parts.append(np.full(per_class, cls, dtype=int))
X = np.vstack(X_parts)
y = np.concatenate(y_parts)

# Inject mild ambiguity into the synthetic scenario labels so that the model is not
# presented as a perfect oracle. This is label noise, not real-world uncertainty modelling.
noise_mask = rng.random(len(y)) < 0.035
for idx in np.where(noise_mask)[0]:
    y[idx] = rng.choice([c for c in range(3) if c != y[idx]])

perm = rng.permutation(len(y))
X, y = X[perm], y[perm]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=RNG_SEED, stratify=y
)
model = RandomForestClassifier(
    n_estimators=51, max_depth=7, min_samples_leaf=5,
    max_features=0.9, class_weight="balanced_subsample",
    random_state=RNG_SEED, n_jobs=-1
)
model.fit(X_train, y_train)
pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)
macro_f1 = f1_score(y_test, pred, average="macro")
cm = confusion_matrix(y_test, pred).tolist()

# Serialize each tree as a compact node array for dependency-free browser inference.
trees = []
for est in model.estimators_:
    t = est.tree_
    nodes = []
    for i in range(t.node_count):
        vals = t.value[i][0].tolist()
        total = sum(vals) or 1
        probs = [v/total for v in vals]
        nodes.append({
            "l": int(t.children_left[i]), "r": int(t.children_right[i]),
            "f": int(t.feature[i]), "t": float(t.threshold[i]) if t.feature[i] >= 0 else 0,
            "p": [round(float(v), 6) for v in probs]
        })
    trees.append(nodes)

importance = {FEATURES[i]: round(float(v), 6) for i, v in enumerate(model.feature_importances_)}
metrics = {
    "name": "ASTRA-VITAL Synthetic Sensor Scenario Classifier",
    "algorithm": "Random Forest Classifier",
    "seed": RNG_SEED,
    "samples": int(len(y)),
    "train_samples": int(len(y_train)),
    "test_samples": int(len(y_test)),
    "test_accuracy": round(float(acc), 4),
    "test_macro_f1": round(float(macro_f1), 4),
    "confusion_matrix": cm,
    "features": FEATURES,
    "classes": CLASSES,
    "display_classes": DISPLAY,
    "feature_importance": importance,
    "synthetic_only": True,
    "clinical_validation": False,
    "note": "Holdout performance measures agreement with synthetic scenario labels only. It is not a measure of medical accuracy, calibration, safety, or performance on real astronaut data."
}

payload = {"meta": metrics, "trees": trees}
model_js = "window.ASTRA_MODEL = " + json.dumps(payload, separators=(",", ":")) + ";\n"
(ROOT / "model.js").write_text(model_js, encoding="utf-8")

with (ROOT / "synthetic_training_data.csv").open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(FEATURES + ["synthetic_scenario_label", "data_origin"])
    for row, label in zip(X, y):
        w.writerow([round(float(v), 3) for v in row] + [CLASSES[int(label)], "SYNTHETIC_GENERATED"])

(ROOT / "model_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
(ROOT / "model_training_report.md").write_text(
    "# ASTRA-VITAL synthetic model training report\n\n"
    f"- Algorithm: {metrics['algorithm']}\n- Synthetic samples: {metrics['samples']}\n"
    f"- Train/test: {metrics['train_samples']}/{metrics['test_samples']}\n"
    f"- Holdout accuracy: {metrics['test_accuracy']:.1%}\n- Holdout macro-F1: {metrics['test_macro_f1']:.3f}\n"
    f"- Seed: {RNG_SEED}\n\n"
    "## Important limitation\n\n"
    "All examples and labels were generated by this script. The model learns to reproduce "
    "synthetic scenario labels. Holdout metrics measure synthetic-label agreement only; they "
    "do not establish clinical validity, real astronaut performance, safety, or readiness for "
    "medical decision-making. Do not use the model for real health decisions.\n",
    encoding="utf-8"
)
print(json.dumps(metrics, indent=2))
