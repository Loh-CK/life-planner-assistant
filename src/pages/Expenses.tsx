import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, DollarSign, Download, Pencil, Trash2, Tag, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { useBudgets } from "@/hooks/useBudgets";
import { PageHeader } from "@/components/PageHeader";

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

  // New category handling for budget form
  const [isNewCategorySelectedBudget, setIsNewCategorySelectedBudget] = useState(false);
  const [budgetNewCategoryName, setBudgetNewCategoryName] = useState("");

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
          {txError ?? budgetsError ?? "Error loading data"}
        </span>
      </div>
    );
  }

  const handleTransFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "category") {
      // Handled by Select's onValueChange
      return;
    }
    setTransForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTrans = { ...transForm, item_type: "expense" as const };
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
    if (name === "amount") {
      setBudgetForm(prev => ({ ...prev, amount: parseFloat(value) || 0 }));
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = isNewCategorySelectedBudget ? budgetNewCategoryName.trim() : budgetForm.category;
    await setBudget(category, budgetForm.amount);
    setShowBudgetModal(false);
    setBudgetForm({ category: "", amount: 0 });
    setIsNewCategorySelectedBudget(false);
    setBudgetNewCategoryName("");
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

  // Spending per category (used for budget progress bars)
  const spendingByCategory: Record<string, number> = {};
  monthTransactions
    .filter(t => t.transaction_type === "expense")
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] ?? 0) + t.amount;
    });

  // Merge categories from transactions and budgets
  const categories = Array.from(new Set([
    ...transactions.map(t => t.category),
    ...budgets.map(b => b.category),
  ]));

  const incomeExpenseData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  // Utility to determine progress bar color
  const getProgressColor = (percent: number) => {
    if (percent > 100) return "#dc2626"; // red
    if (percent > 70) return "#f97316"; // amber/orange
    return "#10b981"; // green
  };

  // Helper functions and derived data for budgets section
  const categoriesWithoutBudget = categories.filter(
    cat => !budgets.some(b => b.category === cat)
  );

  const openEditBudget = (budget: Budget) => {
    setBudgetForm({ category: budget.category, amount: budget.monthly_limit });
    setIsNewCategorySelectedBudget(false);
    setShowBudgetModal(true);
  };

  const openSetBudget = (category: string, amount: number = 0) => {
    setBudgetForm({ category, amount });
    setIsNewCategorySelectedBudget(false);
    setShowBudgetModal(true);
  };

  const escapeCsvField = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const exportCsv = () => {
    const headers = ["Date", "Type", "Category", "Title", "Payment Method", "Amount"];
    const rows = monthTransactions.map(t => [
      t.item_date ?? "",
      t.transaction_type,
      t.category,
      t.title,
      t.payment_method,
      t.amount.toFixed(2),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(field => escapeCsvField(String(field))).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader
        title="Expenses"
        description="Track income, spending, and budgets by category."
        actions={
          <>
            <Select onValueChange={setSelectedMonth} value={selectedMonth}>
              <SelectTrigger className="w-40">
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
            <Button onClick={() => setShowTransModal(true)} variant="default">
              <Plus className="h-4 w-4 mr-2" /> Add Transaction
            </Button>
            <Button onClick={() => setShowBudgetModal(true)} variant="outline">
              Set Category Budget
            </Button>
            <Button
              onClick={exportCsv}
              variant="outline"
              disabled={monthTransactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-rose-600">${totalExpense.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${balance >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {totalIncome > 0 || totalExpense > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incomeExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                  {incomeExpenseData.map(entry => (
                    <Cell key={entry.name} fill={entry.name === "Income" ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4 opacity-50" />
              <p>No transactions this month yet to chart.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budgets section */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {(budgets.length === 0 && categoriesWithoutBudget.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4 opacity-50" />
              <p>No budgets or spending yet. Add a budget to start tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map(budget => {
                const spent = spendingByCategory[budget.category] ?? 0;
                const remaining = budget.monthly_limit - spent;
                const percentUsed = (spent / budget.monthly_limit) * 100;
                const cappedPercent = Math.min(percentUsed, 100);
                return (
                  <Card key={budget.category} className="relative p-4 transition-shadow hover:shadow-md">
                    {/* Action icons */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${budget.category} budget`}
                        onClick={() => openEditBudget(budget)}
                        className="p-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${budget.category} budget`}
                        onClick={() => deleteBudget(budget.category)}
                        className="p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Category heading */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{budget.category}</h3>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 rounded-full bg-muted mt-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cappedPercent}%`,
                          backgroundColor: getProgressColor(percentUsed),
                        }}
                      />
                    </div>

                    {/* Amount info */}
                    <p className="mt-2 text-sm">
                      ${spent.toFixed(2)} spent of ${budget.monthly_limit.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {remaining >= 0
                        ? `Remaining: $${remaining.toFixed(2)}`
                        : `Over budget: $${(-remaining).toFixed(2)}`}
                    </p>
                  </Card>
                );
              })}

              {categoriesWithoutBudget.length > 0 && (
                <>
                  {categoriesWithoutBudget.map(cat => {
                    const spent = spendingByCategory[cat] ?? 0;
                    return (
                      <Card key={cat} className="relative p-4 border-dashed text-muted-foreground">
                        {/* Action button */}
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSetBudget(cat)}
                          >
                            Set Budget
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <Tag className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{cat}</h3>
                        </div>

                        <p className="text-sm">
                          Spent: ${spent.toFixed(2)}
                        </p>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                    <span className={t.transaction_type === "income" ? "text-emerald-600" : "text-rose-600"}>
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
            <Select
              value={transForm.category}
              onValueChange={val => setTransForm(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              value={isNewCategorySelectedBudget ? "new" : budgetForm.category}
              onValueChange={val => {
                if (val === "new") {
                  setIsNewCategorySelectedBudget(true);
                  setBudgetNewCategoryName("");
                } else {
                  setIsNewCategorySelectedBudget(false);
                  setBudgetForm(prev => ({ ...prev, category: val }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="new">+ Add new category...</SelectItem>
              </SelectContent>
            </Select>
            {isNewCategorySelectedBudget && (
              <Input
                type="text"
                placeholder="New category name"
                value={budgetNewCategoryName}
                onChange={e => setBudgetNewCategoryName(e.target.value)}
                required
              />
            )}
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
