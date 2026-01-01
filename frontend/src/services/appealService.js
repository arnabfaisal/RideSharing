import { post } from './api';

export const submitAppeal = (message) =>
  post('/appeals/submit', { message }, true);

export const reviewAppeal = (userId, decision) =>
  post(`/appeals/review/${userId}`, { decision }, true);
