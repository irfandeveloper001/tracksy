import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import feeService from '../../lib/api/feeService';
import {
  BanknotesIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function CreateFeePage() {
  const navigate = useNavigate();
  const [creationType, setCreationType] = useState<'single' | 'bulk'>('single');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: '',
    fee_type: 'transport',
    amount: '',
    semester: '',
    due_date: '',
    description: '',
    send_notification: true,
    student_ids: [] as number[],
  });

  useEffect(() => {
    if (creationType === 'single') {
      loadStudents();
    }
  }, [creationType]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      // You'll need to implement getStudents in your API service
      const response = await fetch('http://localhost:8000/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@tracksy_admin:auth_token')}`,
        },
      });
      const data = await response.json();
      setStudents(data.data || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (creationType === 'single') {
        await feeService.createFee({
          user_id: parseInt(formData.user_id),
          fee_type: formData.fee_type,
          amount: parseFloat(formData.amount),
          semester: formData.semester,
          due_date: formData.due_date,
          description: formData.description,
          send_notification: formData.send_notification,
        });
        alert('Fee created successfully!');
      } else {
        await feeService.createBulkFees({
          fee_type: formData.fee_type,
          amount: parseFloat(formData.amount),
          semester: formData.semester,
          due_date: formData.due_date,
          description: formData.description,
          student_ids: formData.student_ids.length > 0 ? formData.student_ids : undefined,
          send_notification: formData.send_notification,
        });
        alert('Bulk fees created successfully!');
      }
      navigate('/fees');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create fee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Fee</h1>
        <p className="text-gray-600 mt-1">Create fees for students and send notifications</p>
      </div>

      {/* Creation Type Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Creation Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCreationType('single')}
            className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              creationType === 'single'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <UserIcon className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Single Student</div>
              <div className="text-sm text-gray-600">Create fee for one student</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setCreationType('bulk')}
            className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              creationType === 'bulk'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Bulk Creation</div>
              <div className="text-sm text-gray-600">Create fees for all students</div>
            </div>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {creationType === 'single' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            {loadingStudents ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <select
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Type *
          </label>
          <select
            required
            value={formData.fee_type}
            onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="transport">Transportation</option>
            <option value="tuition">Tuition</option>
            <option value="library">Library</option>
            <option value="hostel">Hostel</option>
            <option value="exam">Examination</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="500.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <input
              type="text"
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Spring 2025"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            required
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Optional fee description"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="send_notification"
            checked={formData.send_notification}
            onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="send_notification" className="ml-2 block text-sm text-gray-700">
            Send email notification to {creationType === 'single' ? 'student' : 'all students'}
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/fees')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <BanknotesIcon className="w-5 h-5" />
                <span>Create {creationType === 'bulk' ? 'Bulk ' : ''}Fee{creationType === 'bulk' ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

