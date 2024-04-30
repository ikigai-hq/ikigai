export default {
    logo: (
        <div style={{ display: "flex", alignItems: "center" }}>
            <img
                src="https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/logo/logo.png"
                alt="ikigai"
                width="50px" />
            <p style={{ fontSize: "24px", fontWeight: "700" }}>Ikigai</p>
        </div>
    ),
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
}
