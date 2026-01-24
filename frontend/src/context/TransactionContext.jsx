import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [limits, setLimits] = useState([]); // State for spending limits
  const [loading, setLoading] = useState(false);

  // --- FETCHERS ---
  
  const fetchGoals = async () => {
    if (!user) return;
    try {
      const response = await api.get('transactions/goals/');
      setGoals(response.data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    }
  };

  const fetchLimits = async () => {
    if (!user) return;
    try {
      const response = await api.get('transactions/limits/');
      setLimits(response.data);
    } catch (error) {
      console.error("Failed to fetch limits", error);
    }
  };
  
  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('transactions/'); 
      setTransactions(response.data.map(t => ({
        ...t,
        // Ensure date is standardized for the frontend
        date: new Date(t.date).toISOString().split('T')[0] 
      })));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on mount/login
  useEffect(() => {
    fetchTransactions();
    fetchGoals();
    fetchLimits();
  }, [user]);

  // --- MUTATION METHODS ---
  
  // 1. ADD TRANSACTION
  const addTransaction = async (txData) => {
    try {
      const response = await api.post('transactions/', txData);
      
      const newTx = { ...response.data, date: new Date(response.data.date).toISOString().split('T')[0] };
      setTransactions((prev) => [newTx, ...prev]);
      
      return { success: true, data: newTx };
    } catch (error) {
      return { success: false, error: error.response?.data || "Error adding transaction" };
    }
  };

  // 2. ADD GOAL
  const addGoal = async (goalData) => {
    try {
      const response = await api.post('transactions/goals/', goalData);
      setGoals(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
       let msg = "Failed to create goal.";
       if (error.response?.data?.target_amount) {
           msg = "Target amount must be a valid number.";
       }
       return { success: false, msg };
    }
  };

  // 3. ADD/SAVE BUDGET LIMIT
  const saveBudgetLimits = async (limitData) => {
    try {
        // Send as single POST request (since the modal sends one limit object)
        const response = await api.post('transactions/limits/', limitData[0]); 
        await fetchLimits(); // Refresh list to show new limit
        return { success: true, data: response.data };

    } catch (error) {
        let msg = "Failed to save limit.";
        if (error.response?.data?.non_field_errors) {
             msg = error.response.data.non_field_errors[0];
        }
        return { success: false, msg };
    }
  };

  // 4. DELETE GOAL
  const deleteGoal = async (goalId) => {
    try {
      await api.delete(`transactions/goals/${goalId}/`);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      return { success: true };
    } catch (error) {
      return { success: false, msg: "Failed to delete goal." };
    }
  };

  // 5. DELETE BUDGET LIMIT
  const deleteLimit = async (limitId) => {
    try {
      await api.delete(`transactions/limits/${limitId}/`);
      setLimits(prev => prev.filter(l => l.id !== limitId));
      return { success: true };
    } catch (error) {
      return { success: false, msg: "Failed to delete limit." };
    }
  };
  
  // 6. BULK IMPORT
  const importTransactions = async (csvFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target.result;
        
        const rows = text.split('\n').slice(1).filter(row => row.trim() !== '');
        const parsedData = rows.map(row => {
          const cols = row.split(',');
          if (cols.length < 5) return null; 
          return {
            description: cols[0]?.trim(),
            amount: parseFloat(cols[1]?.trim()),
            category: cols[2]?.trim(),
            date: cols[3]?.trim(),
            type: cols[4]?.trim().toLowerCase()
          };
        }).filter(item => item && !isNaN(item.amount) && item.amount > 0);

        if (parsedData.length === 0) {
          reject("No valid data found in CSV");
          return;
        }

        try {
          const response = await api.post('transactions/bulk/', parsedData);
          const importedTx = response.data.map(t => ({ ...t, date: new Date(t.date).toISOString().split('T')[0] }));
          setTransactions(prev => [...importedTx, ...prev]);
          resolve({ success: true, count: importedTx.length });
        } catch (error) {
          reject(error.response?.data || "Upload failed");
        }
      };

      reader.readAsText(csvFile);
    });
  };
  
  // 7. BUDGET PREDICTION (Used by the Budget page)
  const getBudgetPrediction = async (category, month) => {
    try {
        const response = await api.get('authentication/budget/predict_limit/', {
            params: { category: category, month: month.substring(0, 7) }
        });
        return { success: true, suggestion: response.data.suggestion };
    } catch (error) {
        // Return a safe default if the API call fails
        return { success: false, suggestion: 400.00, msg: "Prediction service failed." };
    }
  };


  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        loading, 
        goals, 
        limits, 
        addTransaction, 
        fetchTransactions, 
        importTransactions,
        addGoal, 
        saveBudgetLimits,
        deleteGoal, 
        deleteLimit,
        getBudgetPrediction 
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);