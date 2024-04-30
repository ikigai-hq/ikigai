export default {
  logo: (
    <>
      <img
        src="https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/logo/logo.svg"
        alt="ikigai"
        width="24px" />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>Ikigai</span>
    </>
  ),
  chat: {
    link: 'https://discord.gg/XuYWkn6kUS',
  },
  project: {
    link: 'https://github.com/ikigai-hq/ikigai',
  },
  docsRepositoryBase: "https://github.com/ikigai-hq/ikigai/tree/master/apps/docs",
  useNextSeoProps() {
    return {
      titleTemplate: '%s – ikigai - Open Assignment Platform'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Ikigai" />
      <meta property="og:description" content="Open Assignment Platform" />
      <link rel="icon" href="https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/logo/logo.svg" />
    </>
  ),
  banner: {
    key: '2.0-release',
    text: (
      <a href="https:https://github.com/ikigai-hq/ikigai/releases/tag/v0.1" target="_blank">
        🎉 Ikigai 0.1 is released. Read more →
      </a>
    )
  },
  footer: {
    text: (
      <span>2024 ©{' '} <a href="https://ikigai.li" target="_blank">Ikigai</a></span>
    )
  },
}