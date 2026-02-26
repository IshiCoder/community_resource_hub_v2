from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def build_models():

    models = {}

    models["Linear Regression"] = LinearRegression()

    models["Random Forest"] = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )

    models["Gradient Boosting"] = GradientBoostingRegressor()

    models["KNN"] = Pipeline([
        ("scaler", StandardScaler()),
        ("model", KNeighborsRegressor(n_neighbors=5))
    ])

    models["Neural Network"] = Pipeline([
        ("scaler", StandardScaler()),
        ("model", MLPRegressor(
            hidden_layer_sizes=(128, 64),
            max_iter=600,
            random_state=42
        ))
    ])

    return models