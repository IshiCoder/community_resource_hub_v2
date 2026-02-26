import numpy as np
import pandas as pd

class ClinicDataSimulator:
    def __init__(self, seed=42):
        np.random.seed(seed)

    def generate_dataset(self, n_samples=5000):
        age = np.random.randint(18, 85, n_samples)

        appointment_type = np.random.randint(0, 4, n_samples)

        visit_history = np.random.randint(0, 20, n_samples)

        severity = np.random.beta(2, 5, n_samples)

        time_of_day = np.random.uniform(8, 17, n_samples)

        # Nonlinear synthetic ground truth function
        duration = (
            8
            + 0.06 * age
            + 6 * appointment_type
            + 0.4 * visit_history
            + 25 * severity
            + np.random.normal(0, 4, n_samples)
        )

        df = pd.DataFrame({
            "age": age,
            "appointment_type": appointment_type,
            "visit_history": visit_history,
            "severity": severity,
            "time_of_day": time_of_day,
            "duration": duration
        })

        return df

if __name__ == "__main__":
    simulator = ClinicDataSimulator()
    df = simulator.generate_dataset()

    df.to_csv("synthetic_clinic_data.csv", index=False)

    print("Dataset generated.")