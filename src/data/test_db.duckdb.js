import { tableToIPC, tableFromJSON } from 'apache-arrow';
import { Database } from "duckdb-async";
import fs from 'fs/promises';  

const dbFile = "/tmp/test_db.duckdb";
fs.rm(dbFile, {force: true});
const db = await Database.create(dbFile);
const con = await db.connect();

await con.exec(`CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
)`);

await con.exec(`INSERT INTO Persons VALUES (1, 'Stephan', 'Schiffels', 'AugBeb16', 'Leipzig')`);
await con.exec(`INSERT INTO Persons VALUES (2, 'Xaver', 'Schiffels', 'ErzBAC', 'Aachen')`);

// const res = await con.all("SHOW ALL TABLES");
// const res = await con.all("SELECT * FROM Persons");
// console.log(res);

const jsonData = [
  {"userId":1,"id":1,"title":"delectus aut autem","completed":false},
  {"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
];  
await con.exec(`INSTALL arrow; LOAD arrow`);
const arrowTable = tableFromJSON(jsonData);
await con.register_buffer("jsonDataTable", [tableToIPC(arrowTable)], true);
await con.exec("CREATE TABLE testTable AS SELECT * FROM jsonDataTable");


// output database file to stdout, so that Framework can cache its result.
await con.close();
await db.close();
const fh = await fs.open(dbFile);
const readStream = fh.createReadStream();
readStream.pipe(process.stdout);
