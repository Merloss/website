export default defineEventHandler(async (event) => {
  const id = (getRouterParam(event, "id") || "").replace(/\.jpg$/i, "");
  return serveSteamImage(event, id, "og");
});
