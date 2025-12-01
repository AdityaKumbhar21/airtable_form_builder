import FormModel from '../models/formModel.js';
import axios from 'axios';
import ResponseModel from '../models/responseModel.js';

export const createForm = async (req, res) => {
  try {
    const { title, baseId, tableId, questions, tableName } = req.body;

    const response = await axios.post(
      `https://api.airtable.com/v0/bases/${baseId}/webhooks`,
      {
        notificationUrl: `${process.env.BACKEND_URL}/webhooks/airtable`,
        specification: {
          options: {
            filters: { dataTypes: ['tableData'], recordChangeScope: tableId }
          }
        }
      },
      { headers: { Authorization: `Bearer ${req.user.accessToken}` } }
    );

    const newForm = await FormModel.create({
      title,
      owner: req.user._id,
      baseId,
      tableId,
      tableName,
      questions,
      airtableWebhookId: response.data.id,
      airtableWebhookSecret: response.data.macSecretBase64,
    });

    res.status(201).json({ form: newForm });
  } catch (err) {
    console.error('Create form error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to create form' });
  }
};


export const getForm = async (req, res) => {
  try{
    const form = await FormModel.findById(req.params.formId)
    .select('-airtableWebhookSecret -airtableWebhookId -owner -__v')

    if(!form){
      return res.status(401).json({message: "Form not found"})
    }

    res.status(200).json({form})
  }
  catch(error){
    console.log("Error in getForm:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export const getUserForms = async (req, res) => {
  try {
    const forms = await FormModel.find({ owner: req.user._id })
      .select('title tableName isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ forms });
  } catch (error) {
    console.log("Error in getUserForms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteForm = async (req, res) => {
  try {
    const form = await FormModel.findOne({ 
      _id: req.params.formId, 
      owner: req.user._id 
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.airtableWebhookId) {
      try {
        await axios.delete(
          `https://api.airtable.com/v0/bases/${form.baseId}/webhooks/${form.airtableWebhookId}`,
          { headers: { Authorization: `Bearer ${req.user.accessToken}` } }
        );
      } catch (error) {
        console.log('Failed to delete Airtable webhook:', error.message);
      }
    }

    await FormModel.findByIdAndDelete(req.params.formId);
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.log("Error in deleteForm:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const submitForm = async(req, res)=>{
  try{
    const {answers} = req.body

    const form = await FormModel.findOne({
      _id: req.params.formId,
      isActive: true,
    }).populate('owner')


    if(!form){
      res.status(401).json({
        message: "Form not found"
      })
    }

    const fields = {}
    for (const q of form.questions ){
      if(q.questionKey !== undefined){
        fields[q.questionKey] = answers[q.questionKey]
      }
    }

    const owner = form.owner

    const response = await axios.post(
      `https://api.airtable.com/v0/${form.baseId}/${form.tableId}`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${owner.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const recordId = response.data.id

    await ResponseModel.create({
      airtableRecordId: recordId,
      formId: form._id,
      responses: answers
    })

    res.status(200).json({
      message: "Form submitted successfully"
    })

  }
  catch(error){
    console.log("Error in submitForm:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}