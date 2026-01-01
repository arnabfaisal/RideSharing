import { get, post } from "./api";

export const createReport = ({ tripId, category, description }) =>
  post("/api/reports", { tripId, category, description }, true);

// NEW: passenger sees their own reports
export const getMyReports = () =>
  get("/api/reports/my", true);
