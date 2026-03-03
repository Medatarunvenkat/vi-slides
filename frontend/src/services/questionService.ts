import api from './api';

export interface Question {
    _id: string;
    content: string;
    user?: { // Optional for guest questions
        _id: string;
        name: string;
    };
    guestName?: string; // For guest questions
    guestEmail?: string; // For guest questions
    session: string;
    status: 'active' | 'archived';
    analysisStatus: 'not_requested' | 'pending' | 'completed' | 'failed';
    refinementStatus?: 'pending' | 'completed' | 'failed';
    refinedContent?: string;
    originalContent?: string;
    refinementTimestamp?: string;
    isPinned: boolean;
    isDirectToTeacher: boolean;
    upvotes: string[];
    teacherAnswer?: string;
    teacherAnsweredAt?: string;
    aiAnalysis?: {
        complexity: 'simple' | 'complex';
        aiAnswer?: string;
        sentiment: string;
        cognitiveLevel: string;
    };
    createdAt: string;
}

export interface CreateQuestionData {
    content: string;
    sessionId: string;
    isDirectToTeacher?: boolean;
}

export const questionService = {
    // Create a new question
    createQuestion: async (data: CreateQuestionData): Promise<{ success: boolean; data: Question }> => {
        const response = await api.post('/questions', data);
        return response.data;
    },

    // Get all session questions
    getSessionQuestions: async (sessionId: string): Promise<{ success: boolean; data: Question[] }> => {
        const response = await api.get(`/questions/session/${sessionId}`);
        return response.data;
    },

    // Update a question
    updateQuestion: async (id: string, content: string): Promise<{ success: boolean; data: Question }> => {
        const response = await api.put(`/questions/${id}`, { content });
        return response.data;
    },

    // Delete a question
    deleteQuestion: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/questions/${id}`);
        return response.data;
    },

    // Toggle pin status
    togglePin: async (id: string): Promise<{ success: boolean; data: Question }> => {
        const response = await api.patch(`/questions/${id}/pin`);
        return response.data;
    },

    // Respond to a question
    respondToQuestion: async (id: string, answer: string): Promise<{ success: boolean; data: Question }> => {
        const response = await api.patch(`/questions/${id}/respond`, { answer });
        return response.data;
    },

    // Toggle upvote
    toggleUpvote: async (id: string): Promise<{ success: boolean; data: Question }> => {
        const response = await api.patch(`/questions/${id}/upvote`);
        return response.data;
    },

    // Request AI analysis (Teacher only)
    requestAIAnalysis: async (id: string): Promise<{ success: boolean; data: Question }> => {
        const response = await api.patch(`/questions/${id}/analyze`);
        return response.data;
    }
};
