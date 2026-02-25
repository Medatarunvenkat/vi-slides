import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
    title: string;
    description: string;
    teacher: mongoose.Types.ObjectId;
    maxMarks: number;
    deadline: Date;
    createdAt: Date;
    status: 'active' | 'closed';
}

const AssignmentSchema = new Schema<IAssignment>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
