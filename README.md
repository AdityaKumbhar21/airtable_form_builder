# FormBuilder for Airtable

A full-stack form builder application that creates beautiful, responsive forms and syncs responses directly to your Airtable bases using OAuth 2.0 integration.

Live Link: https://airtable-form-builder-iota.vercel.app

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Airtable account with API access
- ngrok (for local webhook testing)

### 1. Clone the Repository

```bash
git clone https://github.com/AdityaKumbhar21/airtable_form_builder.git
cd airtable_form_builder
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formbuilder
JWT_SECRET=your_super_secret_jwt_key_here
AIRTABLE_CLIENT_ID=your_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/airtable/callback
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

---

## Airtable OAuth Setup Guide

### Step 1: Create an Airtable OAuth Integration

1. Go to [airtable.com/create/oauth](https://airtable.com/create/oauth)
2. Click **"Register a new OAuth integration"**
3. Fill in the details:
   - **Name:** FormBuilder (or your app name)
   - **Website:** Your app URL
   - **Redirect URI:** `http://localhost:3000/auth/airtable/callback` (for local) or your production callback URL

### Step 2: Configure Scopes

Enable the following OAuth scopes:

| Scope | Description |
|-------|-------------|
| `data.records:read` | Read records from tables |
| `data.records:write` | Create/update records |
| `schema.bases:read` | List bases and tables |
| `webhook:manage` | Create/delete webhooks |

### Step 3: Get Credentials

After creating the integration, copy:
- **Client ID** → `AIRTABLE_CLIENT_ID`
- **Client Secret** → `AIRTABLE_CLIENT_SECRET`

### Step 4: Update Redirect URI for Production

When deploying, update the redirect URI in Airtable to:
```
https://your-backend-domain.com/auth/airtable/callback
```

---

## Data Model Explanation

### User Model (`models/userModel.js`)

Stores authenticated users and their Airtable tokens.

```javascript
{
  airtableId: String,      // Unique Airtable user ID
  email: String,           // User's email
  accessToken: String,     // Airtable OAuth access token
  refreshToken: String,    // Token for refreshing access
  tokenExpiry: Date,       // When the access token expires
  scopes: [String]         // Granted OAuth scopes
}
```

### Form Model (`models/formModel.js`)

Stores form configuration and Airtable mapping.

```javascript
{
  title: String,                    // Form title
  owner: ObjectId (ref: User),      // Form creator
  baseId: String,                   // Airtable base ID
  tableId: String,                  // Airtable table ID
  tableName: String,                // Table display name
  questions: [{
    type: String,                   // text, email, number, select, multiselect, date, checkbox
    label: String,                  // Question text displayed to user
    questionKey: String,            // Airtable field name
    required: Boolean,              // Is field required?
    options: [String]               // Options for select/multiselect
  }],
  isActive: Boolean,                // Is form accepting responses?
  airtableWebhookId: String,        // Webhook ID for sync
  airtableWebhookSecret: String     // Webhook verification secret
}
```

### Response Model (`models/responseModel.js`)

Stores form submissions.

```javascript
{
  formId: ObjectId (ref: Form),     // Parent form
  airtableRecordId: String,         // Created Airtable record ID
  responses: Object                 // Key-value pairs of answers
}
```

---

## Conditional Logic Explanation

### Field Type Mapping

The form builder maps Airtable field types to form input types:

| Airtable Field Type | Form Input Type | Component |
|---------------------|-----------------|-----------|
| `singleLineText` | `text` | Text input |
| `email` | `email` | Email input |
| `phoneNumber` | `text` | Text input |
| `number`, `currency`, `percent` | `number` | Number input |
| `singleSelect` | `select` | Dropdown |
| `multipleSelects` | `multiselect` | Multi-select |
| `date`, `dateTime` | `date` | Date picker |
| `checkbox` | `checkbox` | Checkbox |
| `multilineText` | `text` | Textarea |

### Form Builder Flow

1. **User logs in** → OAuth with Airtable
2. **Select Base** → Fetches user's bases via API
3. **Select Table** → Fetches tables in selected base
4. **Load Fields** → Fetches table schema, maps to form fields
5. **Customize Form** → Edit labels, set required fields
6. **Create Form** → Saves to MongoDB, creates Airtable webhook
7. **Share Form** → Public URL for submissions

### Submission Flow

1. User fills out public form
2. Frontend validates required fields
3. Backend receives submission
4. Maps answers to Airtable field names
5. Creates record in Airtable table
6. Stores response in MongoDB
7. Returns success to user

---

## Webhook Configuration

### What Webhooks Do

Webhooks enable real-time sync between Airtable and FormBuilder. When records change in Airtable, the webhook notifies our backend.

### Webhook Setup (Automatic)

When a form is created, the backend automatically:

1. Creates a webhook for the selected table
2. Stores the webhook ID and secret
3. Configures the notification URL

### Webhook Endpoint

```
POST /webhooks/airtable
```

### Local Development with ngrok

For local webhook testing, Airtable needs a public URL:

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000
```

Update your `.env`:
```env
BACKEND_URL=https://your-ngrok-url.ngrok-free.app
```

### Webhook Limits

Airtable limits webhooks per OAuth integration:
- **2 webhooks per base per OAuth app**

If you hit this limit, delete old webhooks:

```bash
# List webhooks
curl "https://api.airtable.com/v0/bases/YOUR_BASE_ID/webhooks" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Delete webhook
curl -X DELETE "https://api.airtable.com/v0/bases/YOUR_BASE_ID/webhooks/WEBHOOK_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## How to Run the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ngrok (for webhooks):**
```bash
ngrok http 3000
```

Visit: `http://localhost:5173`

### Production Deployment

#### Backend (Render)

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** `backend`
4. Add environment variables

#### Frontend (Vercel)

1. Import project on [vercel.com](https://vercel.com)
2. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/airtable` | Initiate OAuth flow |
| GET | `/auth/airtable/callback` | OAuth callback |
| GET | `/auth/check` | Verify authentication |

### Airtable Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bases` | List user's bases |
| GET | `/api/tables/:baseId` | List tables in base |
| GET | `/api/fields/:tableId?baseId=` | Get table fields |

### Forms

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/f/create` | Create new form |
| GET | `/f/list` | List user's forms |
| GET | `/f/view/:formId` | Get form by ID |
| DELETE | `/f/delete/:formId` | Delete form |
| POST | `/f/submit/:formId` | Submit form response |

---
## Demo Video

🎥 [Watch Demo Video](https://drive.google.com/file/d/1wBxGLLv15yoFg6Xxx_1yUqd5ArDZAcrb/view?usp=sharing)

---

## Screenshots

### Login Page
![Login](demo2.png)

### Dashboard
![Dashboard](demo1.png)

---



## Author

**Aditya Kumbhar**

- GitHub: [@AdityaKumbhar21](https://github.com/AdityaKumbhar21)

---

