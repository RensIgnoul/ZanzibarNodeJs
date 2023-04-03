const express = require("express");
const router = express.Router();
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: "http://192.168.0.162:8086",
  token:
    "ehg-pTjzO24-PfHASG-9EEIyPMDkVOiu7p7FVNJMsvEFdMV2jhvwlVXCWYXimDISpGOFtWdFwAT09YY1g3E_mA==",
});
const queryApi = influxDB.getQueryApi("APSoftwareProject");

router.get("/ping", (req, res) => {
  res.send("pong");
});

router.get("/:sensorid/:fields/:start/:end/:aggregateWindow", async (req, res) => {
  const sensorid = req.params.sensorid;
  const fields = req.params.fields.split(",");
  const start = req.params.start;
  const end = req.params.end;
  const aggregateWindow = req.params.aggregateWindow;

  try {
    let query = `from(bucket: "TestDataSensor")
    |> range(start: ${start}, stop: ${end})
    |> filter(fn: (r) => r["_measurement"] == "TestMeasurementSensor")`;
    query += `|> filter(fn: (r) => r["_field"] == "${fields[0]}"`;
    //query += ` |> filter(fn: (r) => r["_field"] == "${field}")`;
    for (let i = 1; i < fields.length; i++) {
      query += `or r["_field"] == "${fields[i]}"`;
    }
    query += `)`;
    query += `|> filter(fn: (r) => r["id"] == "${sensorid}")
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
