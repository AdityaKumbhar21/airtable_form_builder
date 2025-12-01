import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { formsAPI } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  Checkbox,
  Spinner,
} from '@/components/ui';
import { CheckCircle, Layers, Send } from 'lucide-react';

export default function PublicForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const { data } = await formsAPI.get(formId);
      setForm(data.form);

      const initialAnswers = {};
      (data.form?.questions || []).forEach((q) => {
        if (q.questionType === 'checkbox') {
          initialAnswers[q.questionKey] = false;
        } else if (q.questionType === 'multipleSelects') {
          initialAnswers[q.questionKey] = [];
        } else {
          initialAnswers[q.questionKey] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingRequired = form.questions
      .filter((q) => q.isRequired)
      .filter((q) => {
        const value = answers[q.questionKey];
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'boolean') return false;
        return !value || !value.toString().trim();
      });

    if (missingRequired.length > 0) {
      toast.error(`Please fill in: ${missingRequired.map((q) => q.questionLabel).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await formsAPI.submit(formId, answers);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const updateAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (question) => {
    const { questionKey, questionLabel, questionType, questionPlaceholder, isRequired, options } =
      question;

    switch (questionType) {
      case 'multilineText':
        return (
          <Textarea
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            placeholder={questionPlaceholder}
            className="mt-2"
          />
        );

      case 'singleSelect':
        return (
          <Select
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            className="mt-2"
          >
            <option value="">Select an option...</option>
            {options?.choices?.map((choice) => (
              <option key={choice.id || choice.name} value={choice.name}>
                {choice.name}
              </option>
            ))}
          </Select>
        );

      case 'multipleSelects':
        return (
          <div className="mt-2 space-y-2">
            {options?.choices?.map((choice) => (
              <label key={choice.id || choice.name} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={(answers[questionKey] || []).includes(choice.name)}
                  onChange={(e) => {
                    const current = answers[questionKey] || [];
                    if (e.target.checked) {
                      updateAnswer(questionKey, [...current, choice.name]);
                    } else {
                      updateAnswer(questionKey, current.filter((v) => v !== choice.name));
                    }
                  }}
                />
                <span className="text-sm">{choice.name}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <Checkbox
              checked={answers[questionKey] || false}
              onChange={(e) => updateAnswer(questionKey, e.target.checked)}
            />
            <span className="text-sm">{questionPlaceholder || 'Yes'}</span>
          </label>
        );

      case 'email':
        return (
          <Input
            type="email"
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            placeholder={questionPlaceholder || 'email@example.com'}
            className="mt-2"
          />
        );

      case 'url':
        return (
          <Input
            type="url"
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            placeholder={questionPlaceholder || 'https://example.com'}
            className="mt-2"
          />
        );

      case 'phoneNumber':
        return (
          <Input
            type="tel"
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            placeholder={questionPlaceholder || '+1 (555) 000-0000'}
            className="mt-2"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            className="mt-2"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={answers[questionKey] || ''}
            onChange={(e) => updateAnswer(questionKey, e.target.value)}
            placeholder={questionPlaceholder}
            className="mt-2"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">
              This form may have been removed or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏸️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Form Paused</h2>
            <p className="text-muted-foreground">
              This form is currently not accepting responses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <Card className="max-w-md w-full shadow-xl border border-stone-200">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-stone-500 mb-6">
              Your response has been submitted successfully.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Branding */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-900">
            FormBuilder
          </span>
        </div>

        <Card className="shadow-xl border border-stone-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-orange-500 p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{form.title}</h1>
            <p className="mt-2 opacity-90">Please fill out the form below</p>
          </div>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.questionKey || index} className="space-y-1">
                  <Label className="text-base">
                    {question.questionLabel}
                    {question.isRequired && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  {renderField(question)}
                </div>
              ))}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Response
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-stone-500 mt-6">
          Powered by FormBuilder · Never share sensitive information
        </p>
      </div>
    </div>
  );
}
