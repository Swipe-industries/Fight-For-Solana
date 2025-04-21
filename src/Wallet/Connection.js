import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
function Connect() {

  return (
    <>
      <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/DL8F5n7FL72zjV5xTLVaPwx06zQLzg2X"}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                  <div>
                    <div>
                      <WalletMultiButton />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                <WalletDisconnectButton />
              </div>
                  <div>
                    </div>
                  </div>
                    
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    </>
  )
}

export default Connect;