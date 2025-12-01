import mongoose from 'mongoose';

const ConditionSchema = new mongoose.Schema({
  questionKey: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    enum: ['equals', 'notEquals', 'contains'],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
});

const ConditionalRulesSchema = new mongoose.Schema({
  logic: {
    type: String,
    enum: ['AND', 'OR'],
    required: true,
  },
  conditions: [ConditionSchema],
});

const QuestionSchema = new mongoose.Schema({
  questionKey: {
    type: String,
    required: true,
  },
  fieldId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    
  },
  type: {
    type: String,
    enum: [
      'singleLineText',
      'multilineText',
      'singleSelect',
      'multipleSelects',
      'multipleAttachments',
    ],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },

  conditionalRules: {
    type: ConditionalRulesSchema,
    default: null,
  },
  
  originalFieldName: String,
  options: [String], 
});

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Form',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  baseId: {
    type: String,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
  tableName: {
    type: String,
  }, 

  questions: [QuestionSchema],

  airtableWebhookId: String,   
  airtableWebhookSecret: String, 

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, 
});

const FormModel = mongoose.model('Form', FormSchema);
export default FormModel;