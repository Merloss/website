export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const size = isSteamImageSize(q.size) ? q.size : "thumb";
  return serveSteamImage(event, String(q.id ?? ""), size);
});
