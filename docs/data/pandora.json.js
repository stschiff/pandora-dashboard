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

const qSites = `SELECT Id, Site_Id, Name, Country, Latitude, Longitude
FROM TAB_Site
WHERE projects LIKE '%MICROSCOPE%' OR Site_Id IN ("THR", "YAB", "MTR", "GLE", "MAK", "HBU", "MOM", "BRM", "EML", "GRS", 
  "AGA", "DSM", "FZH", "IDB", "LLD")`;
const sites = await getQuery(qSites);

const qInds = "SELECT Id, Full_Individual_Id, Site, C14_Calibrated_From, C14_Calibrated_To, Archaeological_Date_From, Archaeological_Date_To FROM TAB_Individual WHERE projects LIKE '%MICROSCOPE%'";
const individuals = await getQuery(qInds);

const qSamples = "SELECT S.Id, S.Full_Sample_Id, S.Individual, S.Experiment_Date, T.Name FROM TAB_Sample AS S INNER JOIN TAB_Type_Group AS T ON S.Type_Group = T.Id WHERE S.projects LIKE '%MICROSCOPE%'";
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