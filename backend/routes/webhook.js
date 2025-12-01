import express from 'express';
import crypto from 'crypto';
import Form from '../models/Form.js';
import Response from '../models/Response.js';

const webHookRouter = express.Router();


webHookRouter.post('/webhooks/airtable', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-airtable-signature'];
  const payload = req.body;

  if (!signature || !payload) {
    return res.status(400).send('Bad request');
  }

  try {
    
    const webhookId = payload.webhookId || payload.webhook?.id;
    const form = await Form.findOne({ airtableWebhookId: webhookId });

    if (!form || !form.airtableWebhookSecret) {
      return res.status(404).send('Webhook not found');
    }

    
    const hmac = crypto.createHmac('sha256', form.airtableWebhookSecret);
    hmac.update(payload);
    const calculated = hmac.digest('base64');

    if (calculated !== signature) {
      return res.status(401).send('Invalid signature');
    }

    
    const changes = payload.changedTablesById || {};
    for (const tableId in changes) {
      if (tableId !== form.tableId) continue;

      const changedRecords = changes[tableId].changedRecordsById || {};
      for (const recordId in changedRecords) {
        const change = changedRecords[recordId];

        if (change.current?.deleted) {
          await Response.updateOne(
            { form: form._id, airtableRecordId: recordId },
            { deletedInAirtable: true }
          );
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Server error');
  }
});

export default webHookRouter;