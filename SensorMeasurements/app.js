// TODO EDIT UPDATE TAG

require("dotenv").config({ path: "../.env" });
const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: "http://localhost:2222",//process.env.INFLUXDB_URL,
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
  if (topic.slice(-2)=="up"){//payload.hasOwnProperty("uplink_message.decoded_payload")) {
    let executed = false;
    const point = new Point("sensor_data").tag(
      "id",
      payload.end_device_ids.device_id
    );
    const errorbyte = payload.uplink_message.decoded_payload.errorbyte;
    if (errorbyte.toString(2).slice(-1) != "1") {
      point
        .floatField(
          "humidity_BME",
          payload.uplink_message.decoded_payload.humidity_BME
        )
        .floatField(
          "pressure_BME",
          payload.uplink_message.decoded_payload.pressure_BME
        )
        .floatField(
          "temp_BME",
          payload.uplink_message.decoded_payload.temp_BME
        );
      executed = true;
    }
    if (errorbyte.toString(2).slice(-2, -1) != "1") {
      point
        .intField("CO2_SCD", payload.uplink_message.decoded_payload.CO2_SCD)
        .floatField(
          "humidity_SCD",
          payload.uplink_message.decoded_payload.humidity_SCD
        )
        .floatField(
          "temp_SCD",
          payload.uplink_message.decoded_payload.temp_SCD
        );
      executed = true;
    }
    if (errorbyte.toString(2).slice(-3, -2) != "1") {
      point
        .floatField("PM10", payload.uplink_message.decoded_payload.PM10)
        .floatField("PM2_5", payload.uplink_message.decoded_payload.PM2_5);
      executed = true;
    }
    if (errorbyte.toString(2).slice(-4, -3) != "1") {
      point.booleanField("battery_low", false);
      executed = true;
    } else {
      point.booleanField("battery_low", true);
      executed = true;
    }
    if (errorbyte.toString(2).slice(-5, -4) != "1") {
      point
        .floatField("latitude", payload.uplink_message.decoded_payload.lat)
        .floatField("longitude", payload.uplink_message.decoded_payload.lon);
      executed = true;
    }
    writeApi.writePoint(point);
    
  }
});

// Handle errors
client.on("error", function (err) {
  console.log(`MQTT error: ${err}`);
});
