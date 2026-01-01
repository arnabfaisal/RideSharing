import { post, get } from "./api";

/**
 * Passenger rates a completed trip
 * POST /api/ratings/:tripId
 */
export const createRating = ({ tripId, stars, comment }) => {
  return post(
    `/api/ratings/${tripId}`,
    { stars, comment },
    true
  );
};

/**
 * Driver views their ratings
 * GET /api/ratings/driver/my
 */
export const getMyDriverRatings = () => {
  return get("/api/ratings/driver/my", true);
};

export const respondToRating = (ratingId, response) => {
  return post(
    `/api/ratings/${ratingId}/respond`,
    { response },
    true
  );
};
export const getMyPassengerRatings = () => {
  return get("/api/ratings/passenger/my", true);
};