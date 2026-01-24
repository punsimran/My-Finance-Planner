# backend/authentication/ml_service.py

import os
import joblib
import pandas as pd
# Add these imports:
from django.conf import settings
from transactions.models import Transaction # Needed for the ORM features in the views.py

# Define paths to model artifacts using BASE_DIR from settings
# NOTE: BASE_DIR is typically the directory containing manage.py (i.e., 'backend/')
ML_MODELS_DIR = os.path.join(settings.BASE_DIR, 'ml_models')

MODEL_PATH = os.path.join(ML_MODELS_DIR, 'budget_regressor.pkl')
ENCODER_PATH = os.path.join(ML_MODELS_DIR, 'category_encoder.joblib')

# Global variables to store the loaded model and encoder
budget_model = None
category_encoder = None

def load_ml_models():
    """Loads the pickled model and encoder into memory upon server startup."""
    global budget_model, category_encoder
    
    if budget_model is None or category_encoder is None:
        try:
            budget_model = joblib.load(MODEL_PATH)
            category_encoder = joblib.load(ENCODER_PATH)
            print("✅ ML Models loaded successfully.")
        except FileNotFoundError:
            print(f"❌ WARNING: ML models not found in {ML_MODELS_DIR}. Predictions will be unavailable.")
        except Exception as e:
            print(f"❌ ERROR loading ML artifacts: {e}")

# Load models immediately when this file is imported
load_ml_models()


def predict_budget_limit(target_category, total_monthly_income, target_month_index):
    """
    Predicts the recommended spending limit for a given category and financial context.
    
    Args:
        target_category (str): The name of the category (e.g., 'Food').
        total_monthly_income (float): The user's total expected income for the month.
        target_month_index (int): The index of the month (1 for Jan, 12 for Dec).

    Returns:
        float: The predicted budget amount.
    """
    if budget_model is None or category_encoder is None:
        return None 
    
    try:
        # 1. Encode the target category
        encoded_category = category_encoder.transform([target_category])[0]
        
        # 2. Prepare the input DataFrame (MUST match training features order/names)
        input_data = pd.DataFrame([[
            target_month_index, 
            total_monthly_income, 
            encoded_category
        ]], 
        columns=['month_index', 'total_income', 'category_encoded'])

        # 3. Predict
        prediction = budget_model.predict(input_data)[0]
        
        # Predictions cannot be negative
        return max(0, round(float(prediction), 2))

    except ValueError:
        # Handles case where the category is new and was not in the training set
        return None
    except Exception as e:
        print(f"Prediction failed: {e}")
        return None