import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

from models import build_models

def evaluate_models():

    df = pd.read_csv("synthetic_clinic_data.csv")

    X = df.drop("duration", axis=1)
    y = df["duration"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = build_models()

    results = {}
    trained_models = {}

    for name, model in models.items():

        print(f"Training {name}...")

        model.fit(X_train, y_train)

        pred = model.predict(X_test)

        mae = mean_absolute_error(y_test, pred)
        rmse = np.sqrt(mean_squared_error(y_test, pred))

        # Scheduler simulation metric
        from scheduler_simulator import simulate_clinic_schedule
        idle_time = simulate_clinic_schedule(pred)

        results[name] = {
            "MAE": mae,
            "RMSE": rmse,
            "Idle Time": idle_time
        }

        trained_models[name] = model

    return results, trained_models, X_test, y_test

if __name__ == "__main__":
    results, _, _, _ = evaluate_models()
    print(results)