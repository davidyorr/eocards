module.exports = {
  devServer: {
    https: false,
    client: {
      webSocketURL: {
        protocol: 'ws',
        hostname: 'localhost',
        port: 8080
      }
    }
  }
}