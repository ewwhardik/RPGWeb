"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Coins,
  Shield,
  Dumbbell,
  BookOpen,
  Heart,
  MessageSquare,
  Smile,
} from "lucide-react";
import { TaskItem, parseChecklistItems } from "./TaskBoardGrid";

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => Promise<void>;
  editingTask?: TaskItem | null;
  defaultType?: "HABIT" | "DAILY" | "TODO" | "REWARD";
}

const CATEGORIES = [
  { id: "STRENGTH", label: "Strength", icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: "INTELLECT", label: "Intellect", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "VITALITY", label: "Vitality", icon: <Heart className="w-3.5 h-3.5" /> },
  { id: "DEXTERITY", label: "Dexterity", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "CHARISMA", label: "Charisma", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: "SANITY", label: "Sanity", icon: <Smile className="w-3.5 h-3.5" /> },
];

const DIFFICULTIES = [
  { id: "TRIVIAL", label: "Trivial", multiplier: "0.5x" },
  { id: "EASY", label: "Easy", multiplier: "1.0x" },
  { id: "MEDIUM", label: "Medium", multiplier: "1.5x" },
  { id: "HARD", label: "Hard", multiplier: "2.0x" },
];

const DAYS = [
  { dayIndex: "0", label: "Su" },
  { dayIndex: "1", label: "M" },
  { dayIndex: "2", label: "Tu" },
  { dayIndex: "3", label: "W" },
  { dayIndex: "4", label: "Th" },
  { dayIndex: "5", label: "F" },
  { dayIndex: "6", label: "Sa" },
];

export default function TaskEditorModal({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultType = "HABIT",
}: TaskEditorModalProps) {
  const [type, setType] = useState<"HABIT" | "DAILY" | "TODO" | "REWARD">(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("INTELLECT");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [up, setUp] = useState(true);
  const [down, setDown] = useState(false);
  const [repeatDays, setRepeatDays] = useState<string[]>(["0", "1", "2", "3", "4", "5", "6"]);
  const [dueDate, setDueDate] = useState("");
  const [cost, setCost] = useState(20);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setType(editingTask.type);
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setCategory(editingTask.category || "INTELLECT");
      setDifficulty(editingTask.difficulty || "MEDIUM");
      setUp(editingTask.up ?? true);
      setDown(editingTask.down ?? false);
      if (editingTask.repeatDays) {
        setRepeatDays(editingTask.repeatDays.split(","));
      } else {
        setRepeatDays(["0", "1", "2", "3", "4", "5", "6"]);
      }
      setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : "");
      setCost(editingTask.cost || 20);
      if (editingTask.checklist) {
        setChecklist(parseChecklistItems(editingTask.checklist));
      } else {
        setChecklist([]);
      }
    } else {
      setType(defaultType);
      setTitle("");
      setDescription("");
      setCategory("INTELLECT");
      setDifficulty("MEDIUM");
      setUp(true);
      setDown(false);
      setRepeatDays(["0", "1", "2", "3", "4", "5", "6"]);
      setDueDate("");
      setCost(20);
      setChecklist([]);
    }
    setErrorMessage(null);
  }, [editingTask, defaultType, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIdx: string) => {
    if (repeatDays.includes(dayIdx)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIdx));
    } else {
      setRepeatDays([...repeatDays, dayIdx]);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please grant your task a descriptive title.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await onSave({
        id: editingTask?.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        category,
        difficulty,
        up,
        down,
        repeatDays: type === "DAILY" ? repeatDays.join(",") : null,
        checklist: type === "TODO" && checklist.length > 0 ? JSON.stringify(checklist) : null,
        dueDate: type === "TODO" && dueDate ? dueDate : null,
        cost: type === "REWARD" ? Number(cost) : null,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record task in the archives.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1f26] border border-[#333b47] rounded-xl w-full max-w-lg shadow-2xl p-6 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-stone-100">
              {editingTask ? "Edit Task" : "Create New Task"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 rounded-lg p-2.5">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Type Switcher (only when creating new) */}
          {!editingTask && (
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Task Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["HABIT", "DAILY", "TODO", "REWARD"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      type === t
                        ? "bg-amber-500 border-amber-400 text-stone-950 shadow-md"
                        : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    {t === "HABIT"
                      ? "Habit"
                      : t === "DAILY"
                      ? "Daily"
                      : t === "TODO"
                      ? "To-Do"
                      : "Reward"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read 10 pages of spellcraft"
              className="w-full bg-[#13161c] border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Notes / Description */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, context, or heroic motivations..."
              className="w-full bg-[#13161c] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Habit Specific: Up and Down Controls */}
          {type === "HABIT" && (
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-lg">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Habit Triggers
              </span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={up}
                    onChange={(e) => setUp(e.target.checked)}
                    className="rounded border-stone-700 text-emerald-500 focus:ring-0 w-4 h-4 bg-stone-950"
                  />
                  <span>Positive (+) Trigger</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={down}
                    onChange={(e) => setDown(e.target.checked)}
                    className="rounded border-stone-700 text-red-500 focus:ring-0 w-4 h-4 bg-stone-950"
                  />
                  <span>Negative (−) Trigger</span>
                </label>
              </div>
            </div>
          )}

          {/* Daily Specific: Repeat Days */}
          {type === "DAILY" && (
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Repeat Schedule
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS.map((d) => {
                  const isActive = repeatDays.includes(d.dayIndex);
                  return (
                    <button
                      key={d.dayIndex}
                      type="button"
                      onClick={() => toggleDay(d.dayIndex)}
                      className={`py-1.5 rounded text-xs font-bold border transition-all ${
                        isActive
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                          : "bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* To-Do Specific: Checklist & Due Date */}
          {type === "TODO" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Checklist Subtasks
                </label>
                <div className="space-y-2 mb-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-1.5 bg-stone-900 border border-stone-800 rounded-md"
                    >
                      <span className="text-xs text-stone-300 flex-1">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-stone-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add subtask item..."
                    className="flex-1 bg-[#13161c] border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 border border-stone-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reward Specific: Gold Cost */}
          {type === "REWARD" && (
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Gold Cost
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full bg-[#13161c] border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                />
                <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Difficulty & Attribute Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`p-1.5 rounded text-xs font-bold border transition-all ${
                      difficulty === d.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Attribute
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#13161c] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
