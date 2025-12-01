import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
  Badge,
} from '@/components/ui';
import {
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Copy,
  MoreVertical,
  Calendar,
  Database,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const { data } = await formsAPI.list();
      setForms(data.forms || []);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      setDeleteLoading(formId);
      await formsAPI.delete(formId);
      setForms(forms.filter((f) => f._id !== formId));
      toast.success('Form deleted successfully');
    } catch (error) {
      toast.error('Failed to delete form');
    } finally {
      setDeleteLoading(null);
    }
  };

  const copyFormLink = (formId, e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(link);
    toast.success('Form link copied to clipboard');
  };

  const openFormPreview = (formId, e) => {
    e.stopPropagation();
    window.open(`/f/${formId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-stone-500 mt-1">
              Manage your forms and view submissions
            </p>
          </div>
          <Link to="/form-builder">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
          </Link>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : forms.length === 0 ? (
          <Card className="border-dashed border-2 border-stone-300 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                No forms yet
              </h3>
              <p className="text-stone-500 text-center max-w-md mb-6">
                Create your first form to start collecting responses and syncing
                them with Airtable.
              </p>
              <Link to="/form-builder">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card
                key={form._id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-stone-200 hover:border-orange-300"
                onClick={() => navigate(`/f/${form._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {form.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Database className="h-3 w-3" />
                        <span className="truncate">{form.tableName}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={form.isActive ? 'success' : 'secondary'}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-stone-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(form.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => copyFormLink(form._id, e)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openFormPreview(form._id, e)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(form._id, e)}
                      disabled={deleteLoading === form._id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {deleteLoading === form._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
