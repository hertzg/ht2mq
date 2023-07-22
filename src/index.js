const HTTP = require('./http')
const MQTT = require('./mqtt');

const {
  MQTT_BROKER = 'mqtt://host.docker.internal',
  TOPIC_PREFIX = 'ht2mq/',
  MQTT_CLIENT_ID = null,
  MQTT_USERNAME = null,
  MQTT_PASSWORD = null,
  MQTT_RETAIN = false,
} = process.env;


MQTT
    .connectPromise(MQTT_BROKER, {
      clientId: MQTT_CLIENT_ID,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD
    })
    .catch((err) => {
      console.error("[MQTT] Error connecting to %j: %s", MQTT_BROKER, err)
      throw err
    })
    .then((client) => {
      console.log("[MQTT] Connected to %j", MQTT_BROKER);
      console.log("[MQTT] retain: ", MQTT_RETAIN);
      return HTTP.create({
            publish: (topic, payload) => {
              return new Promise((resolve, reject) => {
                if (!topic || !topic.trim()) {
                  reject(new Error('Refusing to publish to empty topic'))
                } else {
                  const prefixedTopic = `${ TOPIC_PREFIX }${ topic }`
                  client.publish(prefixedTopic, payload, { retain: MQTT_RETAIN }, (error => {
                    const errorMessage = error && error.message;
                    resolve({
                      success: !errorMessage,
                      error: errorMessage || undefined
                    })
                  }))
                }
              })
            }
          }
      )
    })
    .catch((err) => {
      console.error('[HTTP] Error: %s', err)
    })
    .then((srv) => {
      console.log('[HTTP] Listening @ %j', srv.address())
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })



