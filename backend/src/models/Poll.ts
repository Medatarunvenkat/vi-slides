import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
    question: string;
    type: 'mcq' | 'boolean';
    options: {
        text: string;
        votes: number;
    }[];
    responses: {
        user: mongoose.Types.ObjectId;
        optionIndex: number;
        name: string;
    }[];
    session: mongoose.Types.ObjectId;
    isActive: boolean;
    resultsVisible: boolean;
    createdAt: Date;
}

const pollSchema = new Schema<IPoll>({
    question: {
        type: String,
        required: [true, 'Poll question is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['mcq', 'boolean'],
        default: 'mcq'
    },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
    }],
    responses: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        optionIndex: Number,
        name: String
    }],
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resultsVisible: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default mongoose.model<IPoll>('Poll', pollSchema);
