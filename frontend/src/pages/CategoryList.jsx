import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import CategoryForm from '../components/CategoryForm';

const CategoryList = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // category object being edited

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user.token}` } }),
    [user.token]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/api/categories', authHeader);
        setCategories(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [authHeader]);

  const handleAdd = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const res = await axiosInstance.post('/api/categories', formData, authHeader);
      setCategories((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const res = await axiosInstance.put(`/api/categories/${editingCategory._id}`, formData, authHeader);
      setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? res.data : c)));
      setEditingCategory(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await axiosInstance.delete(`/api/categories/${id}`, authHeader);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        {!showAddForm && !editingCategory && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Category
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      {showAddForm && (
        <CategoryForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          loading={saving}
        />
      )}

      {loading && <p className="text-gray-500">Loading categories…</p>}

      {!loading && (
        categories.length === 0 && !showAddForm ? (
          <p className="text-gray-500">No categories yet. Add one above.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-700">
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Description</th>
                <th className="p-3 border-b">Created</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50 text-sm">
                  {editingCategory?._id === cat._id ? (
                    <td colSpan={4} className="p-3 border-b">
                      <CategoryForm
                        category={cat}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingCategory(null)}
                        loading={saving}
                      />
                    </td>
                  ) : (
                    <>
                      <td className="p-3 border-b font-medium">{cat.name}</td>
                      <td className="p-3 border-b text-gray-600">{cat.description || '—'}</td>
                      <td className="p-3 border-b text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 border-b flex gap-2">
                        <button
                          onClick={() => { setEditingCategory(cat); setShowAddForm(false); }}
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default CategoryList;
