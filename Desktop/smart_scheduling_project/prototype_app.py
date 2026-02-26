import streamlit as st
import pandas as pd
import numpy as np

from train import evaluate_models


st.title("Smart Scheduling AI Prototype")

st.write("Predict appointment duration and compare scheduling models")


# Load models and results once
results, trained_models, X_test, y_test = evaluate_models()


# Model performance table
st.subheader("Model Comparison")

performance_df = pd.DataFrame(results).T
st.dataframe(performance_df)


# User Input Section
st.subheader("Patient Input Data")

age = st.number_input("Age", 18, 90, 30)
appointment_type = st.selectbox("Appointment Type", [0, 1, 2, 3])
visit_history = st.number_input("Previous Visits", 0, 30, 5)
severity = st.slider("Severity", 0.0, 1.0, 0.5)
time_of_day = st.slider("Time of Day", 8.0, 17.0, 12.0)


input_data = pd.DataFrame([{
    "age": age,
    "appointment_type": appointment_type,
    "visit_history": visit_history,
    "severity": severity,
    "time_of_day": time_of_day
}])


if st.button("Predict Appointment Duration"):

    # Select best model (lowest MAE)
    best_model_name = min(results, key=lambda k: results[k]["MAE"])

    best_model = trained_models[best_model_name]

    prediction = best_model.predict(input_data)[0]

    st.success(f"Predicted Appointment Duration: {prediction:.2f} minutes")
    st.write(f"Using Model: {best_model_name}")