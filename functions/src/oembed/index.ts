import { onRequest } from "firebase-functions/v2/https"
import { parse } from "node-html-parser"

export const oembed = onRequest({ cors: false }, async (request, response) => {
  const url = request.query.url as string

  if (!url) {
    response.status(400).send("Missing URL parameter")
    return
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
      const oembed = await oembedResource.text()
      response.send(oembed)
    }
  }
})
