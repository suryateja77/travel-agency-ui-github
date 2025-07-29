
const path = require('path')
const express = require('express')
const compression = require('compression')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()
const port = process.env.PORT || 6060
const apiEndPoint = 'https://matrimonial-api.vercel.app'

app.use(compression())
app.use(express.static(`${__dirname}/build`))

app.use('/api', createProxyMiddleware({
  target: apiEndPoint,
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/',
  },
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(req.method, req.path, '->', apiEndPoint + proxyReq.path)
    }
  },
}))

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, () => {
  console.log(`Application Running on port: ${port}`)
})
