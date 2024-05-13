import { onRequest } from "firebase-functions/v2/https"

export const oEmbed = onRequest(async (request, response) => {
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
  const format = (request.query.format as string) || "json"

  if (!["json", "xml"].includes(format)) {
    response.status(500).send("Invalid format parameter")
    return
  }
  const resource = await fetch(url)
  if (!resource.ok) {
    response.status(resource.status).send(resource.statusText)
    return
  }

  const oembed = {
    type: "rich",
    url,
    provider_url: "https://fusion-fest-oembed-dev.web.app/",
    title: "Rich oEmbed content",
    width: maxwidth || 800,
    height: maxheight || 600,
    provider_name: "Fusion Fest",
    html: `<iframe title="Rich oEmbed content" src="${url}" width="${maxwidth || 800}" height="${
      maxheight || 600
    }"></iframe>`,
    cache_age: 3600,
    version: "1.0",
  }

  if (format === "json") {
    response.json(oembed)
  } else {
    oembed.html = oembed.html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

    response.set("Content-Type", "text/xml")
    const xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
    <oembed>
      ${Object.entries(oembed)
        .map(([key, value]) => `<${key}>${value}</${key}>`)
        .join("\r")}
    </oembed>`

    response.send(xml)
  }
})
