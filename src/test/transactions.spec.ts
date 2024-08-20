import { it, beforeAll, afterAll, describe, expect } from "vitest";
import request from "supertest";
import { app } from "../app";
import { Console } from "console";
import { title } from "process";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("user can create a new transactions", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New transactions",
        amount: 2000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transactions",
        amount: 2000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transactions",
        amount: 2000,
      }),
    ]);
  });
});
