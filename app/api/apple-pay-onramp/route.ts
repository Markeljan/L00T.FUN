import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const fiatAmount = req.nextUrl.searchParams.get("fiatAmount") || 100;

    const paymentLink = await getApplePayPaymentLink(Number(fiatAmount));

    return NextResponse.json({ paymentLink }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

const { CDP_API_KEY_ID, CDP_API_KEY_SECRET } = process.env;
if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
  throw new Error("Missing environment variables");
}

const getApplePayPaymentLink = async (fiatAmount: number) => {
  // get apple pay payment link
  const requestHost = "api.developer.coinbase.com";
  const requestPath = "/onramp/v2/onramp/order";

  const requestUrl = `https://${requestHost}${requestPath}`;

  console.log("REQUEST URL", requestUrl);

  const token = await generateJwt({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    requestMethod: "POST",
    requestHost: requestHost,
    requestPath: requestPath,
    expiresIn: 1200, // optional (defaults to 120 seconds)
  });

  console.log("GENERATED TOKEN", token);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentAmount: fiatAmount.toString(),
      purchaseAmount: fiatAmount.toString(),
      paymentCurrency: "USD",
      purchaseCurrency: "ETH",
      paymentMethod: "GUEST_CHECKOUT_APPLE_PAY",
      destinationAddress: "0x0000000000000000000000000000000000000000",
      destinationNetwork: "base",
      email: "test@test.com",
      phoneNumber: "12055555555",
      phoneNumberVerifiedAt: "2025-08-07T00:00:00Z",
      partnerUserRef: "sandbox-123",
      agreementAcceptedAt: "2025-08-07T00:00:00Z",
    }),
  });

  const data = await response.json();

  const paymentLink = data.paymentLink.url;

  console.log("DATA", data);
  console.log("PAYMENT LINK", paymentLink);

  return paymentLink;
};
