const HTTP = require('http')
const Url = require('url')

const {
  HTTP_PORT = 8080,
  HTTP_PAYLOAD_HEADER = 'x-payload'
} = process.env

const extractTopic = (url) => (url.pathname || '').substr(1)

async function extractTopicAndPayload(req) {
  const url = Url.parse(req.url)
  const topic = extractTopic(url);

  const data = {
    topic,
    payload: ''
  }

  if (req.headers.hasOwnProperty(HTTP_PAYLOAD_HEADER)) {
    data.payload = req.headers[HTTP_PAYLOAD_HEADER]
    return data
  }

  if (url.query) {
    data.payload = url.query
    return data
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk));
    req.once('end', () => {
      if (!req.complete) {
        return reject(new Error('Connection incomplete payload'))
      }

      data.payload = Buffer.concat(chunks).toString('utf8')
      resolve(data)
    })
  })
}

exports.create = ({publish}) => {

  const http = HTTP.createServer(
      async (req, res) => {
        let buffer
        try {
          const {topic, payload} = await extractTopicAndPayload(req);
          const result = await publish(topic, payload)

          buffer = Buffer.from(JSON.stringify({
            topic, payload, result
          }), "utf8");

          res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length': buffer.length})

        } catch (e) {
          buffer = Buffer.from(JSON.stringify({error: e.message}), "utf8")
          res.writeHead(500, {'Content-Type': 'application/json', 'Content-Length': buffer.length})
        } finally {
          res.end(buffer);
        }
      }
  )

  return new Promise((resolve) => {
    http.listen(HTTP_PORT, () => {
      resolve(http);
    })
  })

}
