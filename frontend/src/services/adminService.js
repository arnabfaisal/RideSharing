import { get, put } from "./api";

/**
 * Admin: get all reports
 */
export const getAllReports = () =>
  get("/api/reports", true);

/**
 * Admin: suspend user for N days
 */
export const suspendUser = (userId, days) =>
  put(`/api/admin/suspend/${userId}`, { days }, true);

/**
 * Admin: permanently ban user
 */
export const banUser = (userId) =>
  put(`/api/admin/ban/${userId}`, {}, true);
