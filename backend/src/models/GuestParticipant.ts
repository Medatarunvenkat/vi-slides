import mongoose, { Document, Schema } from 'mongoose';

export interface IGuestParticipant extends Document {
    name: string;
    email: string;
    session: mongoose.Types.ObjectId;
    initialQuestion?: string;
    joinedAt: Date;
}

const guestParticipantSchema = new Schema<IGuestParticipant>({
    name: {
        type: String,
        required: [true, 'Guest name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Guest email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    initialQuestion: {
        type: String,
        trim: true,
        maxlength: [500, 'Question cannot be more than 500 characters']
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups by session
guestParticipantSchema.index({ session: 1, joinedAt: -1 });

const GuestParticipant = mongoose.model<IGuestParticipant>('GuestParticipant', guestParticipantSchema);

export default GuestParticipant;
