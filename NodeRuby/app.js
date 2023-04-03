require("dotenv").config({ path: "../.env" });
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const express = require("express");
const bodyParser = require("body-parser");
const weatherstationRouter = require("./routes/weatherstation");
const sensorRouter = require("./routes/sensor");

const app = express();
const PORT = 5000; // Set the port here
const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
app.use("/api/weatherstation", weatherstationRouter);
app.use("/api/sensor", sensorRouter);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/index.js", function (req, res) {
  res.setHeader("Content-Type", "text/javascript");
  res.sendFile(__dirname + "/script.js");
});

app.post("/submit-form", function (req, res) {
  const data = req.body;
  console.log(data);
  const payload = req.body;

  const point = new Point("testmeasurement");
  if (payload.hasOwnProperty("sensorId")) {
    point
      .stringField("boardId", payload.boardId)
      .stringField("sensorId", payload.sensorId)
      .stringField("SensorName", payload.sensorName);
  } else if (payload.hasOwnProperty("boardName")) {
    point
      .stringField("boardId", payload.boardId)
      .stringField("boardName", payload.boardName)
      .stringField("latitude", payload.boatdLat)
      .stringField("longitude", payload.boardLong);
  } else if (payload.hasOwnProperty("stationId")) {
    point
      .stringField("stationId", payload.stationId)
      .stringField("stationName", payload.stationName)
      .stringField("latitude", payload.stationLat)
      .stringField("longitude", payload.stationLong);
  }
  writeApi.writePoint(point);

  writeApi.flush().then(() => {
    console.log("Data has been written to InfluxDB");
    res.send("Form submitted successfully");
  });
});

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
