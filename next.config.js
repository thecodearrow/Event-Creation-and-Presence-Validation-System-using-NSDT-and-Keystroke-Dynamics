module.exports = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
        config.node = {
            fs: "empty"
        };
        return config;
    }
}