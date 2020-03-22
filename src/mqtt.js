const MQTT = require('mqtt');

exports.connectPromise = (url, opts) => {
  return new Promise((resolve, reject) => {
    const client = MQTT.connect(url, opts);

    const connectHandler = () => {
      client.removeListener("error", errorHandler)
      client.removeListener("close", closeHandler)
      resolve(client);
    }
    const closeHandler = () => {
      client.removeListener("connect", connectHandler)
      client.removeListener("error", errorHandler)
      reject(new Error('Connection closed when trying to connect'))
    }
    const errorHandler = (err) => {
      client.removeListener("connect", connectHandler)
      client.removeListener("close", closeHandler)
      reject(err);
    }

    client.once("connect", connectHandler);
    client.once("close", closeHandler);
    client.once('error', errorHandler);
  });
}
