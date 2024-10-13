import { ConnectButton, lightTheme } from "thirdweb/react";

import { client } from "@/app/client";
import { createWallet } from "thirdweb/wallets";

const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
  ];

  export default function ConnectWallet() {
    return (<ConnectButton
      client={client}
      wallets={wallets}
      theme={"light"}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
    />)
      }