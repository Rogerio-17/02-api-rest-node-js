import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
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

  it("should be able to get a specific transaction", async () => {
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

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    console.log(getTransactionResponse.body);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transactions",
        amount: 2000,
      })
    );
  });

  it("should be able to get the summary", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transactions",
        amount: 3000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transactions",
        amount: 1500,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 1500,
    });
  });
});
