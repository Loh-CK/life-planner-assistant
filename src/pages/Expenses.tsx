import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { useBudgets } from "@/hooks/useBudgets";

interface Transaction {
  id: string;
  item_date: string | null;
  transaction_type: "income" | "expense";
  category: string;
  title: string;
  payment_method: string;
  amount: number;
}

interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  updated_at: string;
}

const Expenses = () => {
  // Supabase hooks
  const {
    items: transactions,
    loading: txLoading,
    error: txError,
    addItem: addTx,
    updateItem: updateTx,
    deleteItem: deleteTx,
  } = usePlannerItems("expense");

  const {
    budgets,
    loading: budgetsLoading,
    error: budgetsError,
    setBudget,
    deleteBudget,
  } = useBudgets();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [transForm, setTransForm] = useState<Omit<Transaction, "id">>({
    item_date: null,
    transaction_type: "expense",
    category: "",
    title: "",
    payment_method: "",
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

  // Loading / error states
  if (txLoading || budgetsLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading expenses…</span>
      </div>
    );
  }

  if (txError || budgetsError) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-destructive">
          {txError?.message ?? budgetsError?.message ?? "Error loading data"}
        </span>
      </div>
    );
  }

  const handleTransFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTrans: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...transForm,
    };
    await addTx(newTrans);
    setShowTransModal(false);
    setTransForm({
      item_date: null,
      transaction_type: "expense",
      category: "",
      title: "",
      payment_method: "",
      amount: 0,
    });
  };

  const handleBudgetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await setBudget(budgetForm.category, budgetForm.amount);
    setShowBudgetModal(false);
    setBudgetForm({ category: "", amount: 0 });
  };

  // Filter transactions for selected month
  const monthStart = `${selectedMonth}-01`;
  const monthEnd = `${selectedMonth}-31`;
  const monthTransactions = transactions.filter(t => {
    if (!t.item_date) return false;
    return t.item_date >= monthStart && t.item_date <= monthEnd;
  });

  const totalIncome = monthTransactions
    .filter(t => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions
    .filter(t => t.transaction_type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Spending per category
  const spendingByCategory: Record<string, number> = {};
  monthTransactions
    .filter(t => t.transaction_type === "expense")
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] ?? 0) + t.amount;
    });

  const chartData = Object.keys(spendingByCategory).map(cat => ({
    category: cat,
    spent: spendingByCategory[cat],
    budget: budgets.find(b => b.category === cat)?.monthly_limit ?? 0,
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
                <TableHead>Title</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthTransactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.item_date ?? "—"}</TableCell>
                  <TableCell>{t.transaction_type}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.payment_method}</TableCell>
                  <TableCell className="text-right">
                    <span className={t.transaction_type === "income" ? "text-green-600" : "text-red-600"}>
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
              name="item_date"
              value={transForm.item_date ?? ""}
              onChange={handleTransFormChange}
              required
            />
            <Select
              value={transForm.transaction_type}
              onValueChange={val => setTransForm(prev => ({ ...prev, transaction_type: val as "income" | "expense" }))}
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
              name="title"
              placeholder="Title"
              value={transForm.title}
              onChange={handleTransFormChange}
              required
            />
            <Input
              type="text"
              name="payment_method"
              placeholder="Payment Method"
              value={transForm.payment_method}
              onChange={handleTransFormChange}
            />
            <Input
              type="number"
              name="amount"
              placeholder="Amount"
              value={transForm.amount.toString()}
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
              value={budgetForm.amount.toString()}
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