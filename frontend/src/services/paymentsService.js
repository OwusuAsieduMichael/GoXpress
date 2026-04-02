import { api } from "./api.js";

const normalizeMethod = (method) => (method === "mobile_money" ? "momo" : method);

export const paymentsService = {
  create: async (payload) => {
    const body = {
      sale_id: payload.saleId,
      amount: payload.amount,
      payment_method: normalizeMethod(payload.paymentMethod),
      status: payload.status || "success",
      amount_received: payload.amountReceived,
      reference: payload.reference || ""
    };

    const { data } = await api.post("/payments", body);
    return data.payment;
  }
};
