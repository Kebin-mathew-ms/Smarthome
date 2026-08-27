import api from './api';
import { io } from 'socket.io-client';

let socketInstance = null;

export const chatService = {
  // Socket Client Helper
  connectSocket: (token) => {
    if (!socketInstance) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });
    }
    return socketInstance;
  },

  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  getSocket: () => socketInstance,

  // REST API Client
  getRoomByBookingId: async (bookingId) => {
    return await api.get(`/chat/rooms/${bookingId}`);
  },

  getMessages: async (bookingId) => {
    return await api.get(`/chat/messages/${bookingId}`);
  },

  sendMessage: async (data) => {
    return await api.post('/chat/message', data);
  },

  editMessage: async (id, message) => {
    return await api.put(`/chat/message/${id}`, { message });
  },

  deleteMessage: async (id) => {
    return await api.delete(`/chat/message/${id}`);
  },

  getSharedMedia: async (bookingId) => {
    return await api.get(`/chat/media/${bookingId}`);
  },

  uploadImage: async (formData) => {
    return await api.post('/chat/upload/image', formData);
  },

  uploadVideo: async (formData) => {
    return await api.post('/chat/upload/video', formData);
  },

  uploadVoice: async (formData) => {
    return await api.post('/chat/upload/voice', formData);
  },

  uploadDocument: async (formData) => {
    return await api.post('/chat/upload/document', formData);
  },

  // Work Updates
  getWorkUpdates: async (bookingId) => {
    return await api.get(`/work-updates/${bookingId}`);
  },

  createWorkUpdate: async (formData) => {
    return await api.post('/work-updates', formData);
  }
};
