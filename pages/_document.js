import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="The bitcoin runes airdrop tool"
        />
        <meta name="keywords" content="Bitcoin, runes, airdrop" />
        <meta property="og:title" content={`airdrop`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`The bitcoin runes airdrop tool`}
        />
        <meta property="og:url" content={`https://runs-airdrop.vercel.app/`} />
        <meta property="og:site_name" content="Bitcoin runes airdeop"></meta>
        <meta
          property="og:image"
          content="https://runs-airdrop.vercel.app/logo.webp"
        ></meta>
        <meta property="og:image:type" content="image/jpg"></meta>
        <meta property="og:image:width" content="2000"></meta>
        <meta property="og:image:height" content="2000"></meta>
        <meta property="og:image:alt" content="dashboard"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
