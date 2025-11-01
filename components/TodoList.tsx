import { useState } from 'react';
import { Check, Trash2, Plus, LogOut, Wifi, WifiOff } from 'lucide-react';
import type { Todo } from '../lib/supabase';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  isOnline: boolean;
  userEmail: string;
  onAdd: (title: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function TodoList({
  todos,
  loading,
  isOnline,
  userEmail,
  onAdd,
  onToggle,
  onDelete,
  onSignOut,
}: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setAdding(true);
    await onAdd(newTodo);
    setNewTodo('');
    setAdding(false);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">My Todos</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                  {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                  <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <button
                  onClick={onSignOut}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            <p className="text-blue-100">{userEmail}</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span>{todos.length} total</span>
              <span>{completedCount} completed</span>
              <span>{todos.length - completedCount} active</span>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleAdd} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new todo..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={adding}
                />
                <button
                  type="submit"
                  disabled={adding || !newTodo.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
            </form>

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading todos...</div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg mb-2">No todos yet</p>
                <p className="text-sm">Add your first todo to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition group"
                  >
                    <button
                      onClick={() => onToggle(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        todo.completed
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {todo.completed && <Check size={14} className="text-white" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {todo.title}
                    </span>
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isOnline && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm text-center">
            You are offline. Changes will sync when you are back online.
          </div>
        )}
      </div>
    </div>
  );
}
