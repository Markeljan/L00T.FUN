/** biome-ignore-all lint/correctness/noUnusedVariables: scripts file for testing */

import { generateJwt } from "@coinbase/cdp-sdk/auth";

const {
  CDP_API_KEY_NAME,
  CDP_API_KEY_ID,
  CDP_API_KEY_SECRET,
  CDP_WALLET_SECRET,
  REQUEST_METHOD,
  REQUEST_HOST,
  REQUEST_PATH,
} = process.env;

if (
  !CDP_API_KEY_NAME ||
  !CDP_API_KEY_ID ||
  !CDP_API_KEY_SECRET ||
  !CDP_WALLET_SECRET ||
  !REQUEST_METHOD ||
  !REQUEST_HOST ||
  !REQUEST_PATH
) {
  throw new Error("Missing environment variables");
}

import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient({
  apiKeyId: CDP_API_KEY_ID,
  apiKeySecret: CDP_API_KEY_SECRET,
  walletSecret: CDP_WALLET_SECRET,
  // basePath: "https://api.cdp.coinbase.com",
});

const executeEOASwap = async () => {
  // Retrieve an existing EVM account with funds already in it
  const account = await cdp.evm.getOrCreateAccount({
    name: "MyExistingFundedAccount",
  });

  // Execute a swap directly on an EVM account in one line
  const { transactionHash } = await account.swap({
    network: "base",
    toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    fromToken: "0x4200000000000000000000000000000000000006", // WETH on Base
    fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
    slippageBps: 100, // 1% slippage tolerance
  });

  console.log(`Swap executed: ${transactionHash}`);
};

const executeSmartAccountSwap = async () => {
  const owner = await cdp.evm.getOrCreateAccount({ name: "MyOwnerAccount" });
  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: "MyExistingFundedSmartAccount",
    owner,
  });

  // Execute a swap directly on a smart account in one line
  const { userOpHash } = await smartAccount.swap({
    network: "base",
    toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    fromToken: "0x4200000000000000000000000000000000000006", // WETH on Base
    fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
    slippageBps: 100, // 1% slippage tolerance
    // Optional: paymasterUrl: "https://paymaster.example.com" // For gas sponsorship
  });

  console.log(`Smart account swap executed: ${userOpHash}`);

  // Wait for the user operation to complete
  const receipt = await smartAccount.waitForUserOperation({ userOpHash });
  console.log(`Status: ${receipt.status}`);
};

// get swap price

const getSwapPrice = async () => {
  const swapPrice = await cdp.evm.getSwapPrice({
    network: "ethereum",
    toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    fromToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
    taker: "0x1234567890123456789012345678901234567890",
  });

  if (swapPrice.liquidityAvailable) {
    console.log(`You'll receive: ${swapPrice.toAmount} USDC`);
    console.log(`Minimum after slippage: ${swapPrice.minToAmount} USDC`);
  }
};

// await getSwapPrice();

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
