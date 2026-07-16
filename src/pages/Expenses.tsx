import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Calendar, DollarSign, ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: "income" | "expense";
  category: string;
  description: string;
  paymentMethod: string;
  amount: number;
}

interface Budget {
  [category: string]: number;
}

const Expenses = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [transForm, setTransForm] = useState<Omit<Transaction, "id">>({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    category: "",
    description: "",
    paymentMethod: "",
    amount: 0,
  });

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState<{
    category: string;
    amount: number;
  }>({
    category: "",
    amount: 0,
  });

  // Load data
  useEffect(() => {
    const storedTrans = JSON.parse(localStorage.getItem("lifePlannerExpenses") ?? "{}") as any;
    setTransactions(storedTrans.transactions ?? []);
    const storedBud = JSON.parse(localStorage.getItem("lifePlannerBudgets") ?? "{}") as any;
    setBudgets(storedBud.budgets ?? {});
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem("lifePlannerExpenses", JSON.stringify({ transactions }));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("lifePlannerBudgets", JSON.stringify({ budgets }));
  }, [budgets]);

  const handleTransFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrans: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...transForm,
    };
    setTransactions(prev => [...prev, newTrans]);
    setShowTransModal(false);
    setTransForm({
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      category: "",
      description: "",
      paymentMethod: "",
      amount: 0,
    });
  };

  const handleBudgetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgets(prev => ({
      ...prev,
      [budgetForm.category]: budgetForm.amount,
    }));
    setShowBudgetModal(false);
    setBudgetForm({ category: "", amount: 0 });
  };

  // Filter transactions for selected month
  const monthStart = `${selectedMonth}-01`;
  const monthEnd = `${selectedMonth}-31`;
  const monthTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);

  const totalIncome = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Spending per category
  const spendingByCategory: Record<string, number> = {};
  monthTransactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] ?? 0) + t.amount;
    });

  const chartData = Object.keys(spendingByCategory).map(cat => ({
    category: cat,
    spent: spendingByCategory[cat],
    budget: budgets[cat] ?? 0,
  }));

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex items-center space-x-2">
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
                return <SelectItem key={val} value={val}>{val}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowTransModal(true)} variant="primary">
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
          <Button onClick={() => setShowBudgetModal(true)} variant="outline">
            Set Category Budget
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions for {selectedMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthTransactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.paymentMethod}</TableCell>
                  <TableCell className="text-right">
                    <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                      ${t.amount.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {monthTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending vs Budget by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spent" fill="#EF4444" name="Spent" />
                <Bar dataKey="budget" fill="#10B981" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction Modal */}
      <Dialog open={showTransModal} onOpenChange={setShowTransModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="space-y-4 mt-4">
            <Input
              type="date"
              name="date"
              value={transForm.date}
              onChange={handleTransFormChange}
              required
            />
            <Select
              value={transForm.type}
              onValueChange={val => setTransForm(prev => ({ ...prev, type: val as "income" | "expense" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              name="category"
              placeholder="Category"
              value={transForm.category}
              onChange={handleTransFormChange}
              required
            />
            <Input
              type="text"
              name="description"
              placeholder="Description"
              value={transForm.description}
              onChange={handleTransFormChange}
            />
            <Input
              type="text"
              name="paymentMethod"
              placeholder="Payment Method"
              value={transForm.paymentMethod}
              onChange={handleTransFormChange}
            />
            <Input
              type="number"
              name="amount"
              placeholder="Amount"
              value={transForm.amount}
              onChange={handleTransFormChange}
              required
              step="0.01"
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={showBudgetModal} onOpenChange={setShowBudgetModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Category Budget</DialogTitle>
            <DialogDescription>Define a monthly limit for a category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetBudget} className="space-y-4 mt-4">
            <Select
              value={budgetForm.category}
              onValueChange={val => setBudgetForm(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="New Category">New Category</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              name="amount"
              placeholder="Budget Amount"
              value={budgetForm.amount}
              onChange={handleBudgetFormChange}
              required
              step="0.01"
            />
            <DialogFooter>
              <Button type="submit">Save Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;