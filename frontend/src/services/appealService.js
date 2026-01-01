import { get, post, put } from './api';

export const submitAppeal = (email, message) =>
  post('/api/appeals', { email, message });

export const reviewAppeal = (userId, decision) =>
  put(`/api/appeals/${userId}/review`, { decision }, true);

export const getPendingAppeals = () =>
  get('/api/appeals', true);
