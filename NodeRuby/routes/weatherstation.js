require("dotenv").config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN
});
const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG);

router.get("/ping", (req, res) => {
  res.send("pong");
});

/*router.get("/temperatures", async (req, res) => {
  try {
    const query = `from(bucket: "TestDataBucket2")
      |> range(start: -30d)
      |> filter(fn: (r) => r["_measurement"] == "TestMeasurement")
      |> filter(fn: (r) => r["_field"] == "temp")`;
    const rows = await queryInfluxDB(query);
    const result = { data: rows };
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});*/

router.get("/:stationid/:fields/:start/:end/:aggregateWindow", async (req, res) => {
  const stationid = req.params.stationid;
  const fields = req.params.fields.split(",");
  const start = req.params.start;
  const end = req.params.end;
  const aggregateWindow = req.params.aggregateWindow;

  try {
    let query = `from(bucket: "flwsb")
    |> range(start: ${start}, stop: ${end})
    |> filter(fn: (r) => r["_measurement"] == "weather_station")`;
    query += `|> filter(fn: (r) => r["_field"] == "${fields[0]}"`;
    //query += ` |> filter(fn: (r) => r["_field"] == "${field}")`;
    for (let i = 1; i < fields.length; i++) {
      query += `or r["_field"] == "${fields[i]}"`;
    }
    query += `)`;
    query += `|> filter(fn: (r) => r["source"] == "${stationid}")
      |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
    |> yield(name: "mean")`;

    //console.log(query);
    const rows = await queryInfluxDB(query);
    const result = { data: rows };
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

function queryInfluxDB(query) {
  return new Promise((resolve, reject) => {
    const rows = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        rows.push(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(rows);
      },
    });
  });
}

module.exports = router;
