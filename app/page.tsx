'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Todo } from '@/lib/supabase';
import localforage from 'localforage';

export default function TodoPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.push('/login');
      setUser(data.session.user);
    };
    loadSession();
  }, [router]);


  const fetchTodos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching todos:', error);
    else setTodos(data || []);
  };

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);

  const addTodo = async () => {
    if (!title.trim() || !user) return;

    const { error } = await supabase.from('todos').insert({
      title: title.trim(),
      completed: false,
      user_id: user.id,
    });

    if (error) console.error('Error adding todo:', error);
    else {
      setTitle('');
      fetchTodos();
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id);
    if (!error) fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredTodos = todos.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  );

  return (
    <main className="min-h-screen bg-white text-black p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Next.js Todos</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button onClick={logout} className="text-sm text-gray-700 underline">
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border border-gray-400 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Add a new task"
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="bg-black text-white font-bold px-4 rounded hover:bg-gray-800"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            className={`px-3 py-1 rounded border ${
              filter === f ? 'bg-black text-white' : 'border-gray-400 text-black'
            }`}
            onClick={() => setFilter(f as 'all' | 'active' | 'completed')}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} Tasks
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filteredTodos.length === 0 ? (
          <li className="text-center text-gray-500 py-8">
            {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos`}
          </li>
        ) : (
          filteredTodos.map(t => (
            <li
              key={t.id}
              className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTodo(t.id, t.completed)}
                className="h-5 w-5 cursor-pointer"
              />
              <span
                className={`flex-1 ${t.completed ? 'line-through text-gray-500' : ''}`}
              >
                {t.title}
              </span>
              <button
                onClick={() => deleteTodo(t.id)}
                className="text-red-600 hover:text-red-800 text-sm px-2"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
