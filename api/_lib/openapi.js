const spec = {
  openapi: "3.0.0",
  info: { title: "UniBridge BKD – Functional Prototype", version: "0.1.0" },
  servers: [{ url: "https://unibrij-proto.vercel.app" }],
  paths: {
    "/bridge/register": { post: { summary: "Register BKD key", responses: { "201": { description: "created" } } } },
    "/bridge/resolve":  { get:  { summary: "Resolve BKD key",   responses: { "200": { description: "ok" } } } },
    "/bridge/route-quote": { post: { summary: "Static route quote", responses: { "200": { description: "ok" } } } }
  }
};
export default spec;
