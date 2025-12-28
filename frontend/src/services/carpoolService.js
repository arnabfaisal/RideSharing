import { get, post } from './api';

export const carpoolService = {
  getGroup: async (groupId) => {
    try {
      const res = await get(`/api/r1/carpool/${groupId}`, true);
      return res.success ? res.data : null;
    } catch (e) {
      console.error('getGroup error', e);
      return null;
    }
  },

  listDriverMatches: async (lat, lon, driverDestLat, driverDestLon) => {
    try {
      const qs = `?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}${driverDestLat?`&driverDestLat=${encodeURIComponent(driverDestLat)}`:''}${driverDestLon?`&driverDestLon=${encodeURIComponent(driverDestLon)}`:''}`;
      const res = await get(`/api/r1/driver/match${qs}`, true);
      return res.success ? res.data : [];
    } catch (e) {
      console.error('listDriverMatches error', e);
      return [];
    }
  },

  acceptGroup: async (groupId) => {
    try {
      const res = await post(`/api/r1/carpool/${groupId}/accept`, {}, true);
      return res;
    } catch (e) {
      console.error('acceptGroup error', e);
      return { success: false, message: e.message };
    }
  }
  ,
  updateLocation: async (groupId, lat, lon) => {
    try {
      const res = await post(`/api/r1/carpool/${groupId}/location`, { lat, lon }, true);
      return res;
    } catch (e) {
      console.error('updateLocation error', e);
      return { success: false, message: e.message };
    }
  },
  updateStatus: async (groupId, status) => {
    try {
      const res = await post(`/api/r1/carpool/${groupId}/status`, { status }, true);
      return res;
    } catch (e) {
      console.error('updateStatus error', e);
      return { success: false, message: e.message };
    }
  },
  rateGroup: async (groupId, rating) => {
    try {
      const res = await post(`/api/r1/carpool/${groupId}/rate`, { rating }, true);
      return res;
    } catch (e) {
      console.error('rateGroup error', e);
      return { success: false, message: e.message };
    }
  },
  getMyActivity: async () => {
    try {
      const res = await get('/api/r1/me/activity', true);
      return res.success ? res.data : { bookings: [], trips: [] };
    } catch (e) {
      console.error('getMyActivity error', e);
      return { bookings: [], trips: [] };
    }
  }
};
