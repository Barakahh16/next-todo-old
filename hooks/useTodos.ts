import { useState, useEffect } from 'react';
import { supabase, type Todo } from '../lib/supabase';

const STORAGE_KEY = 'offline_todos';

export function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    fetchTodos();

    const channel = supabase
      .channel('todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTodos((prev) => [payload.new as Todo, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTodos((prev) => prev.map((todo) => (todo.id === payload.new.id ? payload.new as Todo : todo)));
        } else if (payload.eventType === 'DELETE') {
          setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchTodos = async () => {
    if (!userId) return;

    if (!isOnline) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (cached) {
          setTodos(JSON.parse(cached));
        }
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTodos(data as Todo[]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
      }
    }
    setLoading(false);
  };

  const addTodo = async (title: string) => {
    if (!userId) return;

    const newTodo = {
      user_id: userId,
      title,
      completed: false,
    };

    if (!isOnline) {
      const tempTodo: Todo = {
        id: `temp_${Date.now()}`,
        ...newTodo,
        created_at: new Date().toISOString(),
        // removed updated_at
      };
      setTodos((prev) => [tempTodo, ...prev]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify([tempTodo, ...todos]));
      }
      return;
    }

    const { error } = await supabase.from('todos').insert([newTodo]);
    if (!error) {
      await fetchTodos();
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (!isOnline) {
      const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      setTodos(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      }
      return;
    }

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (!error) {
      await fetchTodos();
    }
  };

  const deleteTodo = async (id: string) => {
    if (!isOnline) {
      const updated = todos.filter((t) => t.id !== id);
      setTodos(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      }
      return;
    }

    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      await fetchTodos();
    }
  };

  return { todos, loading, isOnline, addTodo, toggleTodo, deleteTodo };
}