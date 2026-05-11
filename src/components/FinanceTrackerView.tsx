import React, { useState } from "react";
import { WorkspaceEntity, Task } from "../types";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
} from "lucide-react";

export function FinanceTrackerView({
  entities,
  entity,
  onUpdate,
}: {
  entities: WorkspaceEntity[];
  entity: WorkspaceEntity;
  onUpdate: (e: WorkspaceEntity) => void;
}) {
  const brandFinances = entity.brandDetails?.financials || {
    recurringCosts: [],
    oneOffCosts: [],
    earnings: [],
  };
  const [newCostName, setNewCostName] = useState("");
  const [newCostAmount, setNewCostAmount] = useState("");
  const [newCostType, setNewCostType] = useState("one-off");
  const [newCostInterval, setNewCostInterval] = useState("monthly");

  const addCost = () => {
    if (!newCostName || !newCostAmount) return;
    const newBrand = { ...entity };
    const fins = newBrand.brandDetails?.financials || {
      recurringCosts: [],
      oneOffCosts: [],
      earnings: [],
    };
    if (newCostType === "recurring") {
      fins.recurringCosts.push({
        id: `rc${Date.now()}`,
        name: newCostName,
        amount: parseFloat(newCostAmount),
        interval: newCostInterval,
      });
    } else {
      fins.oneOffCosts.push({
        id: `oc${Date.now()}`,
        name: newCostName,
        amount: parseFloat(newCostAmount),
        date: new Date().toISOString().split("T")[0],
      });
    }
    if (newBrand.brandDetails) newBrand.brandDetails.financials = fins;
    onUpdate(newBrand);
    setNewCostName("");
    setNewCostAmount("");
  };

  const removeRecurring = (id: string) => {
    const newBrand = { ...entity };
    if (newBrand.brandDetails && newBrand.brandDetails.financials) {
      newBrand.brandDetails.financials.recurringCosts =
        newBrand.brandDetails.financials.recurringCosts.filter(
          (c) => c.id !== id,
        );
      onUpdate(newBrand);
    }
  };

  const removeOneOff = (id: string) => {
    const newBrand = { ...entity };
    if (newBrand.brandDetails && newBrand.brandDetails.financials) {
      newBrand.brandDetails.financials.oneOffCosts =
        newBrand.brandDetails.financials.oneOffCosts.filter((c) => c.id !== id);
      onUpdate(newBrand);
    }
  };

  // Compile tasks that are tagged to this brand
  const taggedTasks: Task[] = [];
  entities.forEach((ent) => {
    (ent.tasks || []).forEach((task: Task) => {
      if (task.brandTags?.includes(entity.id)) {
        if (
          task.financials &&
          (task.financials.cost > 0 || task.financials.earnings > 0)
        ) {
          taggedTasks.push(task);
        }
      }
    });
  });

  const totalEarnings =
    brandFinances.earnings.reduce((a, b) => a + b.amount, 0) +
    taggedTasks.reduce((a, t) => a + (t.financials?.earnings || 0), 0);
  const totalOneOffCosts =
    brandFinances.oneOffCosts.reduce((a, b) => a + b.amount, 0) +
    taggedTasks
      .filter((t) => !t.financials?.isRecurring)
      .reduce((a, t) => a + (t.financials?.cost || 0), 0);
  const totalRecurringPerMonth =
    brandFinances.recurringCosts.reduce(
      (a, b) =>
        a +
        (b.interval === "yearly"
          ? b.amount / 12
          : b.interval === "weekly"
            ? b.amount * 4.33
            : b.amount),
      0,
    ) +
    taggedTasks
      .filter((t) => t.financials?.isRecurring)
      .reduce((a, t) => {
        const b = t.financials!;
        return (
          a +
          (b.recurrenceInterval === "yearly"
            ? b.cost / 12
            : b.recurrenceInterval === "weekly"
              ? b.cost * 4.33
              : b.cost)
        );
      }, 0);

  return (
    <div
      className="p-8 h-full overflow-y-auto w-full mx-auto flex flex-col gap-6 custom-scrollbar"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Total Earnings
          </h3>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            ${totalEarnings.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingDown size={16} className="text-rose-500" /> One-Off Costs
          </h3>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            ${totalOneOffCosts.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-[var(--accent)]" /> Avg
            Monthly Recurring
          </h3>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            ${totalRecurringPerMonth.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
        <h3 className="text-lg font-black text-[var(--text-primary)]">
          Add Cost
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Cost Description"
            value={newCostName}
            onChange={(e) => setNewCostName(e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none min-w-[200px]"
          />
          <input
            type="number"
            placeholder="0.00"
            value={newCostAmount}
            onChange={(e) => setNewCostAmount(e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none w-24"
          />
          <select
            value={newCostType}
            onChange={(e) => setNewCostType(e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
          >
            <option value="one-off">One-Off</option>
            <option value="recurring">Recurring</option>
          </select>
          {newCostType === "recurring" && (
            <select
              value={newCostInterval}
              onChange={(e) => setNewCostInterval(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}
          <button
            onClick={addCost}
            className="bg-[var(--accent)] text-black px-4 py-2 font-bold rounded-lg hover:brightness-110 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
          <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">
            Recurring Brand Costs
          </h3>
          {brandFinances.recurringCosts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No recurring costs added.
            </p>
          ) : (
            <div className="space-y-3">
              {brandFinances.recurringCosts.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-[var(--bg-primary)] p-3 rounded-lg border border-white/5"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)] text-sm">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      {c.interval}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[var(--text-primary)]">
                      ${c.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeRecurring(c.id)}
                      className="text-rose-500 hover:bg-rose-500/20 p-2 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
          <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">
            One-Off Brand Costs
          </h3>
          {brandFinances.oneOffCosts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No one-off costs added.
            </p>
          ) : (
            <div className="space-y-3">
              {brandFinances.oneOffCosts.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-[var(--bg-primary)] p-3 rounded-lg border border-white/5"
                >
                  <div className="font-bold text-[var(--text-primary)] text-sm">
                    {c.name}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[var(--text-primary)]">
                      ${c.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeOneOff(c.id)}
                      className="text-rose-500 hover:bg-rose-500/20 p-2 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)]">
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">
          Project & Task Costs/Earnings
        </h3>
        {taggedTasks.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No financial data attached to branded tasks.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                <th className="py-2">Task</th>
                <th className="py-2">Cost</th>
                <th className="py-2">Earnings</th>
                <th className="py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {taggedTasks.map((t) => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="py-3 font-bold text-[var(--text-primary)]">
                    {t.title}
                  </td>
                  <td className="py-3 text-rose-400 font-medium">
                    {t.financials?.cost
                      ? `$${t.financials.cost.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="py-3 text-emerald-400 font-medium">
                    {t.financials?.earnings
                      ? `$${t.financials.earnings.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">
                    {t.financials?.isRecurring
                      ? `Recurring (${t.financials.recurrenceInterval})`
                      : "One-Off"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
