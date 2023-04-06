require("dotenv").config({ path: "../.env" });
const mqtt = require("mqtt");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

// InfluxDB Set-up

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET
);

// MQTT options
options = {
  clientId: "mqttjs01",
  username: process.env.MOSQUITTO_USER,
  password: process.env.MOSQUITTO_PASSWD,
  clean: true,
};

const client = mqtt.connect(process.env.MOSQUITTO_URL_WEATHER_STATION, options);

// Connect to MQTT
client.on("connect", function () {
  console.log("connected");
});

client.on("close", function () {
    console.log("connection closed");
  });

client.on("error", function (error) {
  console.log("Can't connect" + error);
});

// Subscribing to the correct toppic
const topic_s = "gateway_debugging";
client.subscribe(topic_s, { qos: 0 });

client.on("message", function (topic, message, packet) {
  console.log("message is " + message);
  console.log("topic is " + topic);
});

  
