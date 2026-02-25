import api from './api';

export interface Submission {
    _id: string;
    assignment: {
        _id: string;
        title: string;
        maxMarks: number;
        deadline: string;
        teacher?: {
            name: string;
        };
    };
    student: {
        _id: string;
        name: string;
        email: string;
    };
    submissionText: string;
    pdfUrl?: string;
    marksObtained?: number;
    feedback?: string;
    status: 'pending' | 'submitted' | 'graded';
    isLate: boolean;
    submittedAt: string;
    gradedAt?: string;
}

export const submissionService = {
    // Submit assignment (Student only)
    submitAssignment: async (data: {
        assignmentId: string;
        submissionText: string;
        pdfUrl?: string;
    }): Promise<{ success: boolean; data: Submission }> => {
        const response = await api.post('/submissions', data);
        return response.data;
    },

    // Get all submissions for an assignment (Teacher only)
    getSubmissionsByAssignment: async (assignmentId: string): Promise<{ success: boolean; data: Submission[] }> => {
        const response = await api.get(`/submissions/assignment/${assignmentId}`);
        return response.data;
    },

    // Get student's own submissions
    getMySubmissions: async (): Promise<{ success: boolean; data: Submission[] }> => {
        const response = await api.get('/submissions/my-submissions');
        return response.data;
    },

    // Grade submission (Teacher only)
    gradeSubmission: async (
        submissionId: string,
        data: { marksObtained: number; feedback: string }
    ): Promise<{ success: boolean; data: Submission; emailSent: boolean; emailMessage: string }> => {
        const response = await api.patch(`/submissions/${submissionId}/grade`, data);
        return response.data;
    }
};
