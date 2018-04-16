import express from 'express'
import morgan from 'morgan'
import puppeteer from 'puppeteer'
import { parse } from 'url'
import { analyzeServiceWorkers } from './analyzeServiceWorkers'
import { analyzeStats } from './analyzeStats'
import { analyzeTimings } from './analyzeTimings'
import { analyzeType } from './analyzeType'

const app = express()

app.use(morgan('common'))

app.get('/config', async (req, res) => {
  const { url: request } = req.query

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    try {
      const page = await browser.newPage()

      const resourceSet = new Set<Resource>()
      const domains = new Set<string>()
      const protocols = new Map<string, string>()

      // Track domains and resources being loaded
      const client = await page.target().createCDPSession()
      await client.send('Network.enable')
      await client.on('Network.responseReceived', ({ requestId, type, timestamp, response }) => {
        const { url, headers, status, mimeType, protocol, fromServiceWorker, fromDiskCache, timing } = response

        const { host, protocol: scheme, pathname } = parse(url)
        domains.add(host)
        protocols.set(host, protocol)
        resourceSet.add({
          requestId,
          url,
          headers,
          type,
          host,
          scheme,
          pathname,
          status,
          mimeType,
          protocol,
          fromServiceWorker,
          fromDiskCache,
          timing,
        })
      })

      // Enable performance statistics
      await client.send('Performance.enable')

      // Load the document
      const response = await page.goto(request)
      const url = response.url()
      const documentResource = [...resourceSet].find(it => it.url === url)

      // Get the protocol
      const protocol = documentResource.protocol

      // Concurrently analyze
      const [{ framework, language, server }, timings, stats, { serviceWorkers, speedKit }] = await Promise.all([
        // Type analysis
        analyzeType(client, documentResource),

        // Timings analysis
        analyzeTimings(client, page, documentResource),

        // Calculate statistics
        analyzeStats(resourceSet, domains),

        // Service Worker and Speed Kit detection
        analyzeServiceWorkers(browser, page),
      ])

      // URL information
      const urlInfo = parse(url)

      res.status(200)
      res.json({
        url,
        protocol,
        framework,
        language,
        server,
        timings,
        stats,
        speedKit,
        domains: [...domains],
        protocols: [...protocols],
        urlInfo,
        serviceWorkers,
      })
    } catch (e) {
      res.status(404)
      res.json({ message: e.message, stack: e.stack, url: request })
    } finally {
      await browser.close()
    }
  } catch (e) {
    res.status(500)
    res.json({ message: e.message, stack: e.stack, url: request })
  }
})

const port = 8080
const hostname = '0.0.0.0'
app.listen(port, () => {
  console.log(`Server is listening on http://${hostname}:${port}/config`)
})
