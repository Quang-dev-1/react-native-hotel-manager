import apiClient from './api';

export interface ChatMessage {
    id?: number;
    userMessage: string;
    aiResponse: string;
    timestamp?: string;
}

export interface SendMessageRequest {
    message: string;
    userId?: string;
}

class ChatbotService {
    async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
        try {
            console.log('💬 Sending message to AI:', request.message);
            const response = await apiClient.post<ChatMessage>('/chatbot/message', request);
            console.log('✅ AI Response received:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Chatbot error:', error);
            throw new Error(error.response?.data?.message || 'Không thể kết nối với chatbot');
        }
    }

    async getChatHistory(userId: string): Promise<ChatMessage[]> {
        try {
            const response = await apiClient.get<ChatMessage[]>(`/chatbot/history/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get chat history error:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải lịch sử chat');
        }
    }
}

export default new ChatbotService();