"use client";

import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet as OckWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import type { FC } from "react";

type WalletConnectProps = { className?: string };

const WalletConnect: FC<WalletConnectProps> = ({ className }) => {
  // Constrain and truncate on small screens to avoid header overflow.
  // Scales down slightly on mobile, expands normally from sm and up.
  const wrapperClass = [
    "min-w-0",
    "max-w-[160px] sm:max-w-none",
    "scale-95 sm:scale-100",
    "origin-right",
    className ?? "",
  ].join(" ");

  return (
    <OckWallet className={wrapperClass}>
      <ConnectWallet className="bg-[#0000FF]">
        <Name className="text-white truncate max-w-[6.5rem] sm:max-w-none" />
      </ConnectWallet>
      <WalletDropdown
        classNames={{
          container: "bg-[#0000FF]",
          swap: {
            container: "bg-[#0000FF]",
          },
          qr: {
            container: "bg-[#0000FF]",
          },
        }}
      >
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </OckWallet>
  );
};

export default WalletConnect;
