import { onRequest } from "firebase-functions/v2/https"
import { parse } from "node-html-parser"
// import xml = require("xml")

export const oEmbedConsumer = onRequest(
  { cors: true },
  async (request, response) => {
    let url = request.query.url as string

    if (!url) {
      response.status(400).send("Missing URL parameter")
      return
    }

    if (!url.startsWith("http")) {
      url = "https://" + url
    }
    const maxwidth = request.query.maxwidth
    const maxheight = request.query.maxheight
    const format = request.query.format

    const resource = await fetch(url)
    const root = parse(await resource.text())

    // Parse the text to extract the relevant information
    // and construct the oEmbed response
    const linkType =
      format === "json" ? "application/json+oembed" : "text/xml+oembed"
    const linkEls = root.querySelectorAll(`link[type='${linkType}']`)

    if (linkEls.length === 0) {
      response.status(404).send("Not found")
      return
    } else if (linkEls.length > 1) {
      response.status(500).send("Multiple oEmbed links found")
      return
    } else {
      const linkEl = linkEls[0]
      const oembedUrl = linkEl.getAttribute("href")

      if (!oembedUrl) {
        response.status(500).send("No oEmbed URL found")
        return
      }

      let resourceURL = oembedUrl
      if (maxwidth) {
        resourceURL += `&maxwidth=${maxwidth}`
      }
      if (maxheight) {
        resourceURL += `&maxheight=${maxheight}`
      }

      const oembedResource = await fetch(resourceURL)
      if (!oembedResource.ok) {
        response
          .status(oembedResource.status)
          .send("Failed to fetch oEmbed resource")
        return
      }

      if (format === "json") {
        const oembed = await oembedResource.json()
        response.json(oembed)
      } else {
        const oembed = unescapeHtml(await oembedResource.text())
        response.set("Content-Type", "text/xml")
        response.send(oembed)
      }
    }
  }
)

/**
 * Uneascape HTML entities in a string
 * @param {string} escaped - String with escaped HTML entities
 * @return {String} - String with HTML entities unescaped
 */
function unescapeHtml(escaped: string): string {
  return escaped
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
