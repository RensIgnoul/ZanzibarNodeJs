require("dotenv").config({ path: "../.env" });
const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  "APSoftwareProject",
  "testappbucket"
  //process.env.INFLUXDB_ORG,
  //process.env.INFLUXDB_BUCKET
);

// Connect to MQTT broker
const client = mqtt.connect(`mqtt://${process.env.TTN_HOST}`, {
  username: process.env.TTN_USERNAME,
  password: process.env.TTN_API_TOKEN,
});

// Subscribe to a topic
const topic = process.env.TTN_MQTT_TOPIC;
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
    // CO2_SCD value exists in the object
    console.log(typeof payload.uplink_message.decoded_payload.CO2_SCD);
    console.log(
      "CO2_SCD value: " + payload.uplink_message.decoded_payload.CO2_SCD
    );
    const point = new Point("testsensor")
      .intField("CO2_SCD", payload.uplink_message.decoded_payload.CO2_SCD)
      .floatField(payload.uplink_message.decoded_payload.humidity_BME)
      .floatField(payload.uplink_message.decoded_payload.humidity_SCD)
      .floatField(payload.uplink_message.decoded_payload.pressure_BME)
      .floatField(payload.uplink_message.decoded_payload.temp_BME)
      .floatField(payload.uplink_message.decoded_payload.temp_SCD);
  }
});

// Handle errors
client.on("error", function (err) {
  console.log(`MQTT error: ${err}`);
});
