import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { mockTasks, Task } from '../data/mockTasks';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const statusOptions: Task['status'][] = ['Todo', 'In Progress', 'Done', 'Archived'];

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const original = mockTasks.find(t => t.id === id);

  const [task, setTask] = useState<Task | undefined>(original ? { ...original } : undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  if (!task) {
    return (
      <div className="ml-64 flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Task not found</p>
        <Link to="/tasks" className="mt-3 text-blue-600 hover:underline text-sm">← Back to tasks</Link>
      </div>
    );
  }

  const handleSave = () => {
    setToast({ message: 'Task updated successfully!', type: 'success' });
  };

  const handleDelete = () => {
    setShowDelete(false);
    navigate('/tasks');
  };

  return (
    <div className="ml-64 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/tasks" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-gray-400 font-mono">{task.id}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={task.title}
            onChange={e => setTask({ ...task, title: e.target.value })}
            data-testid="detail-input-title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={task.description}
            onChange={e => setTask({ ...task, description: e.target.value })}
            data-testid="detail-input-desc"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={task.status}
            onChange={e => setTask({ ...task, status: e.target.value as Task['status'] })}
            data-testid="detail-select-status"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
          <select
            value={task.assignee}
            onChange={e => setTask({ ...task, assignee: e.target.value })}
            data-testid="detail-select-assignee"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Alice Chen', 'Bob Smith', 'Charlie Davis', 'Diana Prince'].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            value={task.dueDate}
            onChange={e => setTask({ ...task, dueDate: e.target.value })}
            data-testid="detail-input-due"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            data-testid="detail-btn-delete"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="detail-btn-save"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>"{task.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50" data-testid="delete-btn-cancel">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700" data-testid="delete-btn-confirm">Delete</button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TaskDetail;
