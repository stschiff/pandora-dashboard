import { tableToIPC, tableFromJSON } from 'apache-arrow';
import duckdb from 'duckdb'
import fs from 'fs';

const dbFile = "/tmp/pandora_eager.duckdb";
fs.rm(dbFile, (err) => {if(err)console.warn(err)});
const db = new duckdb.Database(dbFile);
const con = db.connect();

// con.run(`CREATE TABLE Persons (
//     PersonID int,
//     LastName varchar(255),
//     FirstName varchar(255),
//     Address varchar(255),
//     City varchar(255)
// )`)

// con.run(`INSERT INTO Persons VALUES (1, 'Stephan', 'Schiffels', 'AugBeb16', 'Leipzig')`, (err) => {if(err)console.warn(err)});
// con.run(`INSERT INTO Persons VALUES (2, 'Xaver', 'Schiffels', 'ErzBAC', 'Aachen')`, (err) => {if(err)console.warn(err)});
// con.all("SELECT * FROM Persons", function(err, res) {console.log(res)});
// con.all("SHOW TABLES", (err, res) => console.log(res));
// con.close();

const jsonData = [
  {"userId":1,"id":1,"title":"delectus aut autem","completed":false},
  {"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
];

const jsonData2 = [
    {"userId":2,"id":1,"title":"delectus aut autem","completed":false},
    {"userId":2,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
  ];
  
con.exec(`INSTALL arrow; LOAD arrow;`, (err) => {
    if (err) {
        console.warn(err);
        return;
    }

    const arrowTable = tableFromJSON(jsonData.concat(jsonData2));
    con.register_buffer("jsonDataTable", [tableToIPC(arrowTable)], true, (err) => {
        if (err) {
            console.warn(err); 
            return;
        }
    con.exec("CREATE TABLE testTable AS SELECT * FROM jsonDataTable;");
    });
});

// output database file to stdout, so that Framework can cache its result.
const readStream = fs.createReadStream(dbFile);
readStream.pipe(process.stdout);

