import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    airtableRecordId: {
        type: String,
        required: true,
        unique: true
    },
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    responses: {
        type: Object,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
})

const ResponseModel = mongoose.model('Response', responseSchema);
export default ResponseModel;