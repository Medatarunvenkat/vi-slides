import api from './api';

export interface GuestJoinData {
    code: string;
    name: string;
    email: string;
    question?: string;
}

export interface GuestJoinResponse {
    success: boolean;
    data?: any;
    message?: string;
}

export const guestService = {
    async submitGuestJoin(data: GuestJoinData): Promise<GuestJoinResponse> {
        const response = await api.post('/guest/join', data);
        return response.data;
    },

    async getPublicSessionInfo(code: string): Promise<any> {
        const response = await api.get(`/guest/session/${code}`);
        return response.data;
    }
};
