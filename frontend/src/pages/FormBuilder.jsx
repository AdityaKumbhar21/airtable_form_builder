import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { airtableAPI, formsAPI } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Checkbox,
  Spinner,
} from '@/components/ui';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Table,
  Columns,
  GripVertical,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Select Base', icon: Database },
  { id: 2, title: 'Choose Table', icon: Table },
  { id: 3, title: 'Configure Fields', icon: Columns },
];

export default function FormBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [fields, setFields] = useState([]);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedTableName, setSelectedTableName] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);

  // Fetch bases on mount
  useEffect(() => {
    fetchBases();
  }, []);

  // Fetch tables when base changes
  useEffect(() => {
    if (selectedBase) {
      fetchTables();
      setSelectedTable('');
      setSelectedTableName('');
      setFields([]);
      setSelectedFields([]);
    }
  }, [selectedBase]);

  // Fetch fields when table changes
  useEffect(() => {
    if (selectedBase && selectedTable) {
      fetchFields();
      setSelectedFields([]);
    }
  }, [selectedTable]);

  const fetchBases = async () => {
    try {
      setLoading(true);
      const { data } = await airtableAPI.getBases();
      setBases(data.bases || []);
    } catch (error) {
      toast.error('Failed to load Airtable bases');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data } = await airtableAPI.getTables(selectedBase);
      setTables(data.tables || []);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      setLoading(true);
      const { data } = await airtableAPI.getFields(selectedBase, selectedTable);
      setFields(data.fields || []);
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (field) => {
    const exists = selectedFields.find((f) => f.id === field.id);
    if (exists) {
      setSelectedFields(selectedFields.filter((f) => f.id !== field.id));
    } else {
      setSelectedFields([
        ...selectedFields,
        {
          ...field,
          questionKey: field.name,
          questionLabel: field.name,
          questionPlaceholder: '',
          isRequired: false,
        },
      ]);
    }
  };

  const updateFieldConfig = (fieldId, updates) => {
    setSelectedFields(
      selectedFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formTitle.trim() && selectedBase;
      case 2:
        return selectedTable;
      case 3:
        return selectedFields.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    try {
      setSubmitting(true);
      const questions = selectedFields.map((f) => ({
        questionKey: f.questionKey,
        fieldId: f.id,
        questionLabel: f.questionLabel,
        questionType: f.type,
        questionPlaceholder: f.questionPlaceholder,
        isRequired: f.isRequired,
        options: f.options,
      }));

      await formsAPI.create({
        title: formTitle,
        baseId: selectedBase,
        tableId: selectedTable,
        tableName: selectedTableName,
        questions,
      });

      toast.success('Form created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create form');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldTypeLabel = (type) => {
    const labels = {
      singleLineText: 'Text',
      multilineText: 'Long Text',
      singleSelect: 'Dropdown',
      multipleSelects: 'Multi-select',
      email: 'Email',
      url: 'URL',
      phoneNumber: 'Phone',
      checkbox: 'Checkbox',
      date: 'Date',
      multipleAttachments: 'File Upload',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-stone-900">Create New Form</h1>
          <p className="text-stone-500 mt-1">
            Build a form connected to your Airtable base
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-stone-200">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-orange-500 text-white'
                        : isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                        : 'bg-white border-2 border-stone-300 text-stone-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isCurrent ? 'text-stone-900' : 'text-stone-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white shadow-lg border border-stone-200">
          <CardContent className="p-8">
            {loading && currentStep > 1 ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Step 1: Select Base */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-xl mb-1">Select Airtable Base</CardTitle>
                      <CardDescription>
                        Choose the base where form submissions will be stored
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="formTitle">Form Title *</Label>
                        <Input
                          id="formTitle"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g., Contact Form, Survey, Registration"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="base">Select Base *</Label>
                        <Select
                          id="base"
                          value={selectedBase}
                          onChange={(e) => setSelectedBase(e.target.value)}
                          className="mt-2"
                        >
                          <option value="">Choose a base...</option>
                          {bases.map((base) => (
                            <option key={base.id} value={base.id}>
                              {base.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Choose Table */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-xl mb-1">Choose Table</CardTitle>
                      <CardDescription>
                        Select the table to store form responses
                      </CardDescription>
                    </div>

                    <div>
                      <Label htmlFor="table">Select Table *</Label>
                      <Select
                        id="table"
                        value={selectedTable}
                        onChange={(e) => {
                          setSelectedTable(e.target.value);
                          const table = tables.find((t) => t.id === e.target.value);
                          setSelectedTableName(table?.name || '');
                        }}
                        className="mt-2"
                      >
                        <option value="">Choose a table...</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Configure Fields */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-xl mb-1">Configure Fields</CardTitle>
                      <CardDescription>
                        Select and customize the fields for your form
                      </CardDescription>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Available Fields */}
                      <div>
                        <Label className="text-base font-semibold">Available Fields</Label>
                        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-2">
                          {fields.map((field) => {
                            const isSelected = selectedFields.some((f) => f.id === field.id);
                            return (
                              <div
                                key={field.id}
                                onClick={() => handleFieldToggle(field)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-accent'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="pointer-events-none"
                                  />
                                  <span className="font-medium">{field.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                  {getFieldTypeLabel(field.type)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Fields Configuration */}
                      <div>
                        <Label className="text-base font-semibold">
                          Selected Fields ({selectedFields.length})
                        </Label>
                        <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-2">
                          {selectedFields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                              Select fields from the left to configure them
                            </div>
                          ) : (
                            selectedFields.map((field) => (
                              <div
                                key={field.id}
                                className="p-4 rounded-lg border border-border bg-white space-y-3"
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium flex-1">{field.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getFieldTypeLabel(field.type)}
                                  </span>
                                </div>

                                <div>
                                  <Label className="text-xs">Display Label</Label>
                                  <Input
                                    value={field.questionLabel}
                                    onChange={(e) =>
                                      updateFieldConfig(field.id, {
                                        questionLabel: e.target.value,
                                      })
                                    }
                                    placeholder={field.name}
                                    className="mt-1 h-9 text-sm"
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs">Placeholder</Label>
                                  <Input
                                    value={field.questionPlaceholder}
                                    onChange={(e) =>
                                      updateFieldConfig(field.id, {
                                        questionPlaceholder: e.target.value,
                                      })
                                    }
                                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                                    className="mt-1 h-9 text-sm"
                                  />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox
                                    checked={field.isRequired}
                                    onChange={(e) =>
                                      updateFieldConfig(field.id, {
                                        isRequired: e.target.checked,
                                      })
                                    }
                                  />
                                  <span className="text-sm">Required field</span>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Form
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
