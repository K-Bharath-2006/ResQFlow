"""
RESILORA ML TRAINING
Prototype training pipeline using a SYNTHETIC dataset.

Important:
This dataset is generated for prototype/demo development.
It is NOT real disaster data and should not be presented as real-world
model performance. Replace it with validated historical data for real use.
"""

import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

DATA_PATH = "data/resilora_flood_training_dataset.csv"
MODEL_DIR = "ml_models"
os.makedirs(MODEL_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)

# -----------------------------
# Common features
# -----------------------------
FEATURES = [
    "rainfall_mm",
    "water_level_m",
    "flood_depth_m",
    "elevation_m",
    "population_density_per_km2",
    "building_density_per_km2",
    "road_blockage_percent",
    "vulnerable_population_ratio",
    "distance_from_river_km",
    "hospital_access_score",
    "historical_flood_count",
    "infrastructure_damage_score"
]

X = df[FEATURES]

# ============================================================
# MODEL 1: DISASTER SEVERITY CLASSIFICATION
# ============================================================
y_severity = df["severity"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_severity,
    test_size=0.20,
    random_state=42,
    stratify=y_severity
)

severity_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    class_weight="balanced"
)

severity_model.fit(X_train, y_train)
severity_pred = severity_model.predict(X_test)

print("\n===== SEVERITY MODEL =====")
print("Accuracy:", round(accuracy_score(y_test, severity_pred), 4))
print(classification_report(y_test, severity_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, severity_pred))

joblib.dump(severity_model, f"{MODEL_DIR}/severity_model.pkl")

# ============================================================
# MODEL 2: AFFECTED POPULATION REGRESSION
# ============================================================
y_population = df["affected_population"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_population,
    test_size=0.20,
    random_state=42
)

population_model = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

population_model.fit(X_train, y_train)
population_pred = population_model.predict(X_test)

mae = mean_absolute_error(y_test, population_pred)
rmse = mean_squared_error(y_test, population_pred) ** 0.5
r2 = r2_score(y_test, population_pred)

print("\n===== AFFECTED POPULATION MODEL =====")
print("MAE :", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("R2  :", round(r2, 4))

joblib.dump(population_model, f"{MODEL_DIR}/affected_population_model.pkl")

# ============================================================
# MODEL 3: PRIORITY CLASSIFICATION
# ============================================================
# Priority uses predicted/known impact-related variables.
# For a real deployment, priority labels should come from a
# clearly defined expert/authority labeling methodology.
PRIORITY_FEATURES = [
    "rainfall_mm",
    "water_level_m",
    "flood_depth_m",
    "elevation_m",
    "population_density_per_km2",
    "road_blockage_percent",
    "vulnerable_population_ratio",
    "hospital_access_score",
    "infrastructure_damage_score",
    "affected_population"
]

X_priority = df[PRIORITY_FEATURES]
y_priority = df["priority"]

X_train, X_test, y_train, y_test = train_test_split(
    X_priority, y_priority,
    test_size=0.20,
    random_state=42,
    stratify=y_priority
)

priority_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    class_weight="balanced"
)

priority_model.fit(X_train, y_train)
priority_pred = priority_model.predict(X_test)

print("\n===== PRIORITY MODEL =====")
print("Accuracy:", round(accuracy_score(y_test, priority_pred), 4))
print(classification_report(y_test, priority_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, priority_pred))

joblib.dump(priority_model, f"{MODEL_DIR}/priority_model.pkl")

# Save feature lists for the API
joblib.dump(FEATURES, f"{MODEL_DIR}/severity_features.pkl")
joblib.dump(FEATURES, f"{MODEL_DIR}/population_features.pkl")
joblib.dump(PRIORITY_FEATURES, f"{MODEL_DIR}/priority_features.pkl")

print("\nTraining complete.")
print("Saved models:")
print("- models/severity_model.pkl")
print("- models/affected_population_model.pkl")
print("- models/priority_model.pkl")
