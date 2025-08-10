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
  return (
    <OckWallet className={className}>
      <ConnectWallet>
        <Name className="text-inherit" />
      </ConnectWallet>
      <WalletDropdown>
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
