import * as mysql from "mysql"
import * as fs from 'fs/promises';

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

// const r = await getQuery("DESCRIBE TAB_Type");
// console.log(r);

const qSites = `SELECT Id, Site_Id, Name, Country, Latitude, Longitude
FROM TAB_Site
WHERE
  projects LIKE '%MICROSCOPE%' OR
  tags     LIKE '%MICROSCOPE%' OR
  Site_Id  IN   ("THR", "YAB", "MTR", "GLE", "MAK", "HBU", "MOM", "BRM", "EML", "GRS", "AGA", "DSM", "FZH", "IDB", "LLD")`;
const sites = await getQuery(qSites);

const qInds = `SELECT I.Id, I.Full_Individual_Id, I.Site, I.C14_Calibrated_From, I.C14_Calibrated_To, I.Archaeological_Date_From, I.Archaeological_Date_To
FROM       TAB_Individual AS I
INNER JOIN TAB_Site       AS S ON I.Site = S.Id
WHERE
  projects LIKE '%MICROSCOPE%' OR
  I.tags   LIKE '%MICROSCOPE%' OR
  S.tags   LIKE '%MICROSCOPE%'`;
const individuals = await getQuery(qInds);

const qSamples = `SELECT S.Id, S.Full_Sample_Id, S.Individual, S.Experiment_Date, TG.Name AS TypeGroup, T.Name AS Type
FROM       TAB_Sample      AS S
INNER JOIN TAB_Type_Group  AS TG ON S.Type_Group = TG.Id
INNER JOIN TAB_Type        AS T  ON S.Type       = T.Id
INNER JOIN TAB_Individuals AS I  ON S.Individual 
WHERE S.projects LIKE '%MICROSCOPE%' OR S.tags LIKE '%MICROSCOPE%'`;
const samples = await getQuery(qSamples);

const qExtracts = "SELECT Id, Full_Extract_Id, Sample, Experiment_Date FROM TAB_Extract WHERE projects LIKE '%MICROSCOPE%'";
const extracts = await getQuery(qExtracts);

const qLibraries = "SELECT L.Id, L.Full_Library_Id, L.Extract, L.Experiment_Date, P.Name, P.Library_UDG, P.Library_Strandedness FROM TAB_Library AS L INNER JOIN TAB_Protocol AS P ON L.Protocol = P.Id WHERE projects LIKE '%MICROSCOPE%'"
const libraries = await getQuery(qLibraries);

const qCaptures = "SELECT C.Id, C.Full_Capture_Id, C.Library, C.Experiment_Date, P.Name, P.Short_Name FROM TAB_Capture AS C INNER JOIN TAB_Probe_Set AS P ON C.Probe_Set = P.Id WHERE C.projects LIKE '%MICROSCOPE%'"
const captures = await getQuery(qCaptures);

const qSequencings = "SELECT Id, Full_Sequencing_Id, Capture, Experiment_Date FROM TAB_Sequencing WHERE projects LIKE '%MICROSCOPE%'"
const sequencings = await getQuery(qSequencings);

const out = {sites, individuals, samples, extracts, libraries, captures, sequencings};

console.log(JSON.stringify(out));

con.end();