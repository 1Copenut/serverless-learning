import { Hono } from "hono";
import { Client, fql, ServiceError } from "fauna";

type Bindings = {
  FAUNA_SECRET: string;
};

type Variables = {
  faunaClient: Client;
};

type Product = {
  id: string;
  serialNumber: number;
  title: string;
  weightLbs: number;
  quantity: number;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", async (ctx, next) => {
  const faunaClient = new Client({
    secret: ctx.env.FAUNA_SECRET,
  });
  ctx.set("faunaClient", faunaClient);
  await next();
});

app.get("/", (ctx) => {
  return ctx.text("Hello World!");
});

app.get("/products/:productId", async (ctx) => {
  const productId = ctx.req.param("productId");
  const query = fql`Products.byId(${productId})`;
  const result = await ctx.var.faunaClient.query<Product>(query);
  return ctx.json(result.data);
});

app.post("/products", async (ctx) => {
  const { serialNumber, title, weightLbs } = await ctx.req.json<
    Omit<Product, "id">
  >();
  const query = fql`Products.create({
    serialNumber: ${serialNumber},
    title: ${title},
    weightLbs: ${weightLbs},
    quantity: 0
  })`;
  const result = await ctx.var.faunaClient.query<Product>(query);
  return ctx.json(result.data);
});

app.patch("/products/:productId/add-quantity", async (c) => {
  const productId = c.req.param("productId");
  const { quantity } = await c.req.json<Pick<Product, "quantity">>();
  const query = fql`Products.byId(${productId}){ quantity : .quantity + ${quantity}}`;
  const result = await c.var.faunaClient.query<Pick<Product, "quantity">>(
    query
  );
  return c.json(result.data);
});

app.patch("/products/:productId/reduce-quantity", async (ctx) => {
  const productId = ctx.req.param("productId");
  const { quantity } = await ctx.req.json<Pick<Product, "quantity">>();
  const query = fql`Products.byId(${productId}){ quantity : .quantity - ${quantity}}`;
  const result = await ctx.var.faunaClient.query<Pick<Product, "quantity">>(
    query
  );
  return ctx.json(result.data);
});

app.delete("/products/:productId", async (ctx) => {
  const productId = ctx.req.param("productId");
  const query = fql`Products.byId(${productId})!.delete()`;
  const result = await ctx.var.faunaClient.query<Product>(query);
  return ctx.json(result.data);
});

app.onError((err, ctx) => {
  if (err instanceof ServiceError) {
    return ctx.json(
      {
        status: err.httpStatus,
        code: err.code,
        message: err.message,
      },
      err.httpStatus as ResponseInit | undefined
    );
  }
  console.trace(err);
  return ctx.text("Internal service error", 500);
});

export default app;
