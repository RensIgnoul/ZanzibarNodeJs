// TODO EDIT UPDATE TAG

require("dotenv").config({ path: "../.env" });
const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET
);

// Connect to MQTT broker
const client = mqtt.connect(`mqtt://${process.env.TTN_HOST}`, {
  username: process.env.TTN_USERNAME,
  password: process.env.TTN_API_TOKEN,
});

// Connect to MQTT
client.on("connect", function () {
  console.log("connected");
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
  if (
    payload.hasOwnProperty(
      "uplink_message.decoded_payload"
    ) /*.CO2_SCD !== undefined*/
  ) {
    const point = new Point("sensor_data")
      .tag("id", payload.end_device_ids.device_id)
      .intField("CO2_SCD", payload.uplink_message.decoded_payload.CO2_SCD)
      .floatField(
        "humidity_BME",
        payload.uplink_message.decoded_payload.humidity_BME
      )
      .floatField(
        "humidity_SCD",
        payload.uplink_message.decoded_payload.humidity_SCD
      )
      .floatField(
        "pressure_BME",
        payload.uplink_message.decoded_payload.pressure_BME
      )
      .floatField("temp_BME", payload.uplink_message.decoded_payload.temp_BME)
      .floatField("temp_SCD", payload.uplink_message.decoded_payload.temp_SCD)
      .floatField("PM10", payload.uplink_message.decoded_payload.PM10)
      .floatField("PM2_5", payload.uplink_message.decoded_payload.PM2_5)
      .booleanField(
        "bat_critical",
        payload.uplink_message.decoded_payload.bat_critical
      );

    if (payload.uplink_message.decoded_payload.errorbyte == 0) {
      writeApi.writePoint(point);
    }
  }
});

// Handle errors
client.on("error", function (err) {
  console.log(`MQTT error: ${err}`);
});
