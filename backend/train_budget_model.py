import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import numpy as np
from datetime import date

# --- Configuration ---

# Determine the absolute path to the directory containing this script (backend/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define the path where the ML artifacts will be saved (backend/ml_models)
ML_DIR = os.path.join(BASE_DIR, 'ml_models')
os.makedirs(ML_DIR, exist_ok=True)

MODEL_PATH = os.path.join(ML_DIR, 'budget_regressor.pkl')
ENCODER_PATH = os.path.join(ML_DIR, 'category_encoder.joblib')

# Define paths for the training data CSV (assuming it's named 'personal_transactions_dashboard_ready.csv'
# and located next to this script in the backend/ directory)
CSV_PATH = os.path.join(BASE_DIR, 'personal_transactions_dashboard_ready.csv') 


def generate_and_train_budget_model():
    print("--- Starting Data Processing for Budget Model ---")
    print(f"Loading data from: {CSV_PATH}")
    
    try:
        # 1. Load the data
        df = pd.read_csv(CSV_PATH)
    except FileNotFoundError:
        print(f"ERROR: CSV file not found at {CSV_PATH}. Cannot train model.")
        return

    # --- 2. CLEANING AND STANDARDIZATION ---
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('_-', '')
    df = df.rename(columns={'transaction_type': 'type'})
    
    # Standardize Transaction Types
    df['type'] = df['type'].str.lower().str.strip()
    df['type'] = df['type'].replace({'credit card payment': 'expense', 'debit': 'expense', 'credit': 'income', 'paycheck': 'income'})
    
    # Standardize Categories (Critical for consistency)
    df['category'] = df['category'].str.strip().replace({
        'Mortgage & Rent': 'Rent', 
        'Groceries': 'Food', 
        'Dining Out': 'Food', 
        'Restaurants': 'Food', 
        'Fast Food': 'Food', 
        'Coffee Shops': 'Food', 
        'Alcohol & Bars': 'Food', 
        'Television': 'Entertainment', 
        'Movies & Dvds': 'Entertainment', 
        'Music': 'Entertainment', 
        'Gas & Fuel': 'Transport', 
        'Auto Insurance': 'Transport', 
        'Mobile Phone': 'Utilities', 
        'Internet': 'Utilities'
    })
    
    # Convert types
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)


    # --- 3. AGGREGATION TO MONTH x CATEGORY LEVEL ---
    
    # Calculate Total Income for each Month/Year (Feature X)
    monthly_income = df[df['type'] == 'income'].groupby(df['date'].dt.to_period('M'))['amount'].sum().reset_index()
    monthly_income.columns = ['period', 'total_income']

    # Calculate Total Spending for each Month x Category (Target Y)
    monthly_spent = df[df['type'] == 'expense'].groupby([df['date'].dt.to_period('M'), 'category'])['amount'].sum().reset_index()
    monthly_spent.columns = ['period', 'category', 'actual_spent']

    # Merge spending and income data
    df_merged = pd.merge(monthly_spent, monthly_income, on='period', how='left')

    # Add features
    df_merged['month_index'] = df_merged['period'].dt.month
    
    # Prepare the final training data set by aligning the target (Y) to the next month's features (X)
    df_train = df_merged.copy()
    
    # To predict the budget for month N, we use features from month N-1
    df_train['target_spending'] = df_train['actual_spent'].shift(-1)
    
    # Drop the last month's data since we have no target spending for it
    df_train.dropna(subset=['target_spending'], inplace=True) 

    # Filter out low-value categories to focus model training
    df_train = df_train[df_train['category'].isin(['Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment'])]


    print(f"Total final training samples: {len(df_train)}")
    
    if len(df_train) < 20:
        print("WARNING: Dataset is too small for meaningful regression. Need more data.")
        return

    # --- 4. ENCODE CATEGORIES ---
    le = LabelEncoder()
    df_train['category_encoded'] = le.fit_transform(df_train['category'])

    # --- 5. TRAIN MODEL ---
    # Features X: month_index, total_income, category_encoded
    features = ['month_index', 'total_income', 'category_encoded']
    X = df_train[features]
    Y = df_train['target_spending']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, Y)

    # --- 6. SAVE ARTIFACTS ---
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)

    print(f"\n✅ Training Complete. Model saved to: {MODEL_PATH}")
    print(f"Categories mapped: {le.classes_}")


if __name__ == '__main__':
    # Ensure this script is run from the 'backend' folder
    # If it is run via `python train_budget_model.py`, os.getcwd() should be the 'backend' folder.
    generate_and_train_budget_model()