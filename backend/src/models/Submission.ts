import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
    assignment: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    submissionText: string;
    pdfUrl?: string;
    submittedAt: Date;
    marksObtained?: number;
    feedback?: string;
    status: 'pending' | 'submitted' | 'graded';
    isLate: boolean;
    gradedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
    assignment: {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionText: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        default: null
    },
    marksObtained: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'submitted'
    },
    isLate: {
        type: Boolean,
        default: false
    },
    gradedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index to ensure one submission per student per assignment
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
