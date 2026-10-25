import { createHmac, timingSafeEqual } from "crypto";

export const createGiftCardOrderSignature = (orderData) =>
  createHmac("sha256", process.env.STRIPE_SECRET_KEY)
    .update(JSON.stringify(orderData))
    .digest("hex");

export const verifyGiftCardOrderSignature = (orderData, signature) => {
  if (typeof signature !== "string") return false;

  const expected = Buffer.from(createGiftCardOrderSignature(orderData), "hex");
  const received = Buffer.from(signature, "hex");

  return expected.length === received.length && timingSafeEqual(expected, received);
};