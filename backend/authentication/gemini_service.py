import os
import json
from google import genai
from django.conf import settings
from rest_framework import status


try:
    client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
except Exception as e:
    print(f"--- WARNING: GEMINI CLIENT FAILED TO INITIALIZE --- Error: {e}")
    client = None

def get_ai_analysis(transactions, user_data):
    if not client:
        return {"summary": "AI Service is offline.", "recommendations": ["Check server configuration."], "spending_warning": "N/A"}

    # Prepare data for prompt
    transaction_summary = "\n".join([
        f"{t['date']}: {t['description']} ({t['category']}) - {t['type'] == 'expense' and '-' or '+'}${t['amount']}"
        for t in transactions
    ])

    prompt = f"""
        You are an elite, concise financial advisor. Analyze the following user transaction data.
        
        User Name: {user_data['name']}
        Total Income: ${user_data['total_income']:.2f}
        Total Expenses: ${user_data['total_expense']:.2f}
        
        --- Recent Transaction History ---
        {transaction_summary}
        
        --- TASK ---
        Provide your analysis in a brief JSON format. Do not include any introductory or concluding text outside the JSON object.
        JSON Structure MUST BE:
        {{
          "summary": "Concise summary of their financial health.",
          "recommendations": ["Actionable step 1", "Actionable step 2"],
          "spending_warning": "Biggest financial risk or 'None'."
        }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini API call failed: {e}")
        return {"summary": "AI Analysis failed.", "recommendations": ["Try again later."], "spending_warning": "N/A"}