import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    api.get("transactions/").then(res => setTransactions(res.data));
  }, []);

  const addTransaction = async () => {
    const res = await api.post("transactions/", {
      title,
      amount,
      category: "General"
    });
    setTransactions([...transactions, res.data]);
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} />
      <button onClick={addTransaction}>Add</button>

      <ul>
        {transactions.map(txn => (
          <li key={txn.id}>{txn.title} - {txn.amount}</li>
        ))}
      </ul>
    </div>
  );
}
