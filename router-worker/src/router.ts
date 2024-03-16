import { getTodo } from "./routes/todoRoute";

import { Env } from "./index";

export async function routeRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  // Parse the URL to extract pathname
  const url = new URL(request.url);
  const path = url.pathname.split("/").slice(1);

  // Route the request based on the first path segment
  switch (path[0]) {
    case "":
      // Handle the '/' root route
      return new Response("Yahtzee!", { status: 200 });
    case "todo":
      // Handle '/todo' route
      return getTodo(request);
    case "media":
      // Handle '/media' route
      return new Response("Get media!", { status: 200 });
    default:
      // Default case, return a 404 not found
      return new Response("Not found", { status: 404 });
  }
}
