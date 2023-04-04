// TODO EDIT UPDATE TAG

require("dotenv").config({ path: "../.env" });
const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token:
    /*"cY_fUmKExku7YTUNcemt0qwiXvEwHk5GY4tQD0z40epbPHFfc4zaEPGfXbEqNeCiezisrsF7rcTxlO6-7f0dWg==",*/ process
      .env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  "test"
);

// Connect to MQTT broker
const client = mqtt.connect(`mqtt://${process.env.TTN_HOST}`, {
  username: process.env.TTN_USERNAME,
  password: process.env.TTN_API_TOKEN,
});

// Subscribe to a topic
const topic = "#"; //process.env.TTN_MQTT_TOPIC;
client.subscribe(topic, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Subscribed to topic: ${topic}`);
  }
});

// Handle incoming messages
client.on("message", function (topic, message) {
  console.log("message is " + message);
  console.log("topic is " + topic);
  const payload = JSON.parse(message);
  if (payload.uplink_message.decoded_payload.CO2_SCD !== undefined) {
    const point = new Point("testsensor")
      .tag("id", 5)
      .intField("CO2_SCD", payload.uplink_message.decoded_payload.CO2_SCD)
      .floatField(
        "humidity_BME",
        payload.uplink_message.decoded_payload.humidity_BME
      )
      .floatField(
        "humidity_SCD",
        payload.uplink_message.decoded_payload.humidty_SCD
      )
      .floatField(
        "pressure_BME",
        payload.uplink_message.decoded_payload.pressure_BME
      )
      .floatField("temp_BME", payload.uplink_message.decoded_payload.temp_BME)
      .floatField("temp_SCD", payload.uplink_message.decoded_payload.temp_SCD);
    writeApi.writePoint(point);
  }
});

// Handle errors
client.on("error", function (err) {
  console.log(`MQTT error: ${err}`);
});
