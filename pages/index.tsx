import type { NextPage } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"

const PhaserGameNoSSR = dynamic(() => import("../components/game"), {
  ssr: false,
})
const PhaserGamePage: NextPage = () => <PhaserGameNoSSR />

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>我要吹羽毛 V7</title>
        <meta name="description" content="#phaser #matter #webgl" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <PhaserGamePage />
      </main>
    </div>
  )
}

export default Home
