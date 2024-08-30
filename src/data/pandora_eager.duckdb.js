import * as mysql from "mysql"
import * as fs from 'fs/promises';
import duckdb from 'duckdb'
import { tableToIPC, tableFromJSON } from 'apache-arrow';
import { resolve } from "path";

const credentials_raw = await fs.readFile(process.env.HOME + "/.credentials", 'utf8');
const [host, port, user, password] = credentials_raw.split("\n");

const con = mysql.createConnection({host, port, user, password, database: "pandora"});

con.connect(function(err) {
  if (err) throw err;
  console.error("Connected")
});

function getQuery(q) {
  return new Promise((resolve, reject) => {
    con.query(q, function(err, res) {
      if(err) return reject(err);
      resolve(res);
    });
  })
}

function duckDbExec(dbCon, q) {
  return new Promise((resolve, reject) => {
    dbCon.exec(q, function(err, res) {
      if(err) return reject(err);
      resolve(res);
    });
  })
}

function duckDbBuffer(dbCon, name, arrowTable) {
  return new Promise((resolve, reject) => {
    dbCon.register_buffer(name, [tableToIPC(arrowTable)], true, (err, res) => {
      if (err) return reject(err)
      resolve(res);
    });
  })
}

console.error("Querying Pandora for Individual Table");
const qInds = `SELECT
  I.Id,
  I.Full_Individual_Id,
  S.Full_Site_Id,
  S.Name,
  S.Country,
  S.Latitude,
  S.Longitude,
  I.C14_Calibrated_From,
  I.C14_Calibrated_To,
  I.Archaeological_Date_From,
  I.Archaeological_Date_To
FROM
             TAB_Individual AS I
  INNER JOIN TAB_Site       AS S ON I.Site = S.Id
WHERE
  I.Deleted = 'false' AND (
  I.projects LIKE '%MICROSCOPE%' OR
  I.tags     LIKE '%MICROSCOPE%' OR
  S.tags     LIKE '%MICROSCOPE%')`;
const individuals = await getQuery(qInds);

console.error("Querying Pandora for Sample Table");
const qSamples = `SELECT
  Sa.Id,
  Sa.Full_Sample_Id,
  Sa.Individual,
  Sa.Experiment_Date,
  TG.Name            AS TypeGroup,
  T.Name             AS Type
FROM      
             TAB_Sample     AS Sa
  INNER JOIN TAB_Type_Group AS TG ON Sa.Type_Group = TG.Id
  INNER JOIN TAB_Type       AS T  ON Sa.Type       = T.Id
  INNER JOIN TAB_Individual AS I  ON Sa.Individual = I.Id
  INNER JOIN TAB_Site       AS S  ON I.site        = S.Id
WHERE
  Sa.Deleted = 'false' AND (
  Sa.projects LIKE '%MICROSCOPE%' OR
  Sa.tags     LIKE '%MICROSCOPE%' OR
  I.tags      LIKE '%MICROSCOPE%' OR
  S.tags      LIKE '%MICROSCOPE%')`;
const samples = await getQuery(qSamples);

console.error("Querying Pandora for Extracts Table");
const qExtracts = `SELECT
  E.Id,
  E.Full_Extract_Id,
  E.Sample,
  E.Experiment_Date
FROM
             TAB_Extract    AS E
  INNER JOIN TAB_Sample     AS Sa ON E.sample      = Sa.Id
  INNER JOIN TAB_Individual AS I  ON Sa.individual = I.Id
  INNER JOIN TAB_Site       AS S  ON I.site        = S.Id
WHERE
  E.Deleted = 'false' AND (
  E.projects LIKE '%MICROSCOPE%' OR
  E.tags     LIKE '%MICROSCOPE%' OR
  Sa.tags    LIKE '%MICROSCOPE%' OR
  I.tags     LIKE '%MICROSCOPE%' OR
  S.tags     LIKE '%MICROSCOPE%')`;
const extracts = await getQuery(qExtracts);

console.error("Querying Pandora for Library Table");
const qLibraries = `SELECT
  L.Id,
  L.Full_Library_Id,
  L.Extract,
  L.Experiment_Date,
  P.Name,
  P.Library_UDG,
  P.Library_Strandedness
FROM
             TAB_Library  AS L
  INNER JOIN TAB_Protocol   AS P  ON L.Protocol    = P.Id 
  INNER JOIN TAB_Extract    AS E  ON L.extract     = E.Id
  INNER JOIN TAB_Sample     AS Sa ON E.sample      = Sa.Id
  INNER JOIN TAB_Individual AS I  ON Sa.individual = I.Id
  INNER JOIN TAB_Site       AS S  ON I.site        = S.Id
WHERE
  L.Deleted = 'false' AND (
  L.projects LIKE '%MICROSCOPE%' OR
  L.tags     LIKE '%MICROSCOPE%' OR
  E.tags     LIKE '%MICROSCOPE%' OR
  Sa.tags    LIKE '%MICROSCOPE%' OR
  I.tags     LIKE '%MICROSCOPE%' OR
  S.tags     LIKE '%MICROSCOPE%')`;

const libraries = await getQuery(qLibraries);

console.error("Querying Pandora for Captures Table");
const qCaptures = `SELECT
  C.Id,
  C.Full_Capture_Id,
  C.Library,
  C.Experiment_Date,
  P.Name,
  P.Short_Name
FROM
             TAB_Capture    AS C
  INNER JOIN TAB_Probe_Set  AS P ON C.Probe_Set    = P.Id
  INNER JOIN TAB_Library    AS L ON C.library      = L.Id
  INNER JOIN TAB_Extract    AS E  ON L.extract     = E.Id
  INNER JOIN TAB_Sample     AS Sa ON E.sample      = Sa.Id
  INNER JOIN TAB_Individual AS I  ON Sa.individual = I.Id
  INNER JOIN TAB_Site       AS S  ON I.site        = S.Id
WHERE
  C.Deleted = 'false' AND (
  C.projects LIKE '%MICROSCOPE%' OR
  C.tags     LIKE '%MICROSCOPE%' OR
  L.tags     LIKE '%MICROSCOPE%' OR
  E.tags     LIKE '%MICROSCOPE%' OR
  Sa.tags    LIKE '%MICROSCOPE%' OR
  I.tags     LIKE '%MICROSCOPE%' OR
  S.tags     LIKE '%MICROSCOPE%')`;

const captures = await getQuery(qCaptures);

console.error("Querying Pandora for Sequencings Table");
const qSequencings = `SELECT
  Se.Id,
  Se.Full_Sequencing_Id,
  Se.Capture,
  Se.Experiment_Date
FROM
             TAB_Sequencing AS Se
  INNER JOIN TAB_Capture    AS C  ON Se.capture    = C.Id
  INNER JOIN TAB_Library    AS L  ON C.library     = L.Id
  INNER JOIN TAB_Extract    AS E  ON L.extract     = E.Id
  INNER JOIN TAB_Sample     AS Sa ON E.sample      = Sa.Id
  INNER JOIN TAB_Individual AS I  ON Sa.individual = I.Id
  INNER JOIN TAB_Site       AS S  ON I.site        = S.Id
WHERE
  Se.Deleted = 'false' AND (
  Se.projects LIKE '%MICROSCOPE%' OR
  Se.tags     LIKE '%MICROSCOPE%' OR
  C.tags      LIKE '%MICROSCOPE%' OR
  L.tags      LIKE '%MICROSCOPE%' OR
  E.tags      LIKE '%MICROSCOPE%' OR
  Sa.tags     LIKE '%MICROSCOPE%' OR
  I.tags      LIKE '%MICROSCOPE%' OR
  S.tags      LIKE '%MICROSCOPE%')`;
const sequencings = await getQuery(qSequencings);

const out = {individuals, samples, extracts, libraries, captures, sequencings};

console.error("Setting up DuckDB database");
const dbFile = "/tmp/pandora_eager.duckdb";
await fs.rm(dbFile);
const db = new duckdb.Database(dbFile);
const dcon = db.connect();


const jsonData = [
  {"userId":1,"id":1,"title":"delectus aut autem","completed":false},
  {"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
];

dcon.exec(`INSTALL arrow; LOAD arrow;`, (err) => {
  if (err) {
      console.warn(err);
      return;
  }

  const arrowTable = tableFromJSON(jsonData);
  con.register_buffer("jsonDataTable", [tableToIPC(arrowTable)], true, (err) => {
      if (err) {
          console.warn(err); 
          return;
      }
  con.exec("CREATE TABLE testTable AS SELECT * FROM jsonDataTable;");
  });
});
// await duckDbExec(dcon, `INSTALL arrow; LOAD arrow`);
// await duckDbBuffer(dcon, "indTableRaw", tableFromJSON(individuals));
// await duckDbExec(dcon, "CREATE TABLE individuals AS SELECT * FROM indTableRaw");

// output database file to stdout, so that Framework can cache its result.
const readStream = fs.createReadStream(dbFile);
readStream.pipe(process.stdout);

con.end();