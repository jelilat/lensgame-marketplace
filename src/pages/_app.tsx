import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
} from "wagmi";

import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { ApolloProvider } from '@apollo/client'

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import client from 'src/apollo'

import Head from 'next/head'
import dynamic from 'next/dynamic'

const Header = dynamic(
  () => import('@components/Header'),
  { ssr: false }
)
import { AppWrapper } from '@components/utils/AppContext'

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

const { chains, provider, webSocketProvider } = configureChains([chain.polygon], [
  infuraProvider({ infuraId }),
  publicProvider(),
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "Lensdrop",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <body className="bg-gradient-[70deg] from-[#151515] via-[#2d2d2d] to-[#151515] sm:bg-gradient-to-br">
    <AppWrapper>
    <WagmiConfig client={wagmiClient}>
        <ApolloProvider client={client}>
        <div>
            <Head>
              <title>Lensgame Marketplace</title>
              <link rel="shortcut icon" href="/lensgame.png" />
              <meta property="og:title" content="Lensgame Marketplace" />
              <meta property="og:image" content="/lensgame.png" />
              <meta property="og:description" content="Airdrop tokens to your Lens protocol followers with Lensdrop" />
              <meta property="og:url" content="https://lensdrop.xyz" />

              <meta property="twitter:title" content="Lensdrop" />
              <meta property="twitter:site" content="@tjelailah" />
              <meta property="twitter:image" content="/lensgame.png" />
              <meta property="twitter:card" content="summary" />
              <meta property="twitter:description" content="Airdrop tokens to your Lens protocol followers with Lensdrop" />
            </Head>
            <Header />
            <Component {...pageProps} />
        </div>
        </ApolloProvider>
    </WagmiConfig>
    </AppWrapper>
    // </body>
  )
  
}

export default MyApp
