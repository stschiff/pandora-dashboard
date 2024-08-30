import { tableToIPC, tableFromJSON } from 'apache-arrow';
import duckdb from 'duckdb'
import fs from 'fs/promises';

function duckDbQuery(dbCon, q) {
    return new Promise((resolve, reject) => {
      dbCon.all(q, function(err, res) {
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
  

const dbFile = "/tmp/test_db.duckdb";
fs.rm(dbFile, {force: true});
const db = new duckdb.Database(dbFile);
const con = db.connect();

// await duckDbQuery(con, `CREATE TABLE Persons (
//     PersonID int,
//     LastName varchar(255),
//     FirstName varchar(255),
//     Address varchar(255),
//     City varchar(255)
// )`);

// await duckDbQuery(con, `INSERT INTO Persons VALUES (1, 'Stephan', 'Schiffels', 'AugBeb16', 'Leipzig')`);
// await duckDbQuery(con, `INSERT INTO Persons VALUES (2, 'Xaver', 'Schiffels', 'ErzBAC', 'Aachen')`);

con.exec(`CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
    )`, (err) => {
        if(err) console.warn(err);
        con.exec(`
            INSERT INTO Persons VALUES (1, 'Stephan', 'Schiffels', 'AugBeb16', 'Leipzig');
            INSERT INTO Persons VALUES (2, 'Xaver', 'Schiffels', 'ErzBAC', 'Aachen');
            `, async (err) => {
                if(err) console.warn(err);
                const fh = await fs.open(dbFile);
                const readStream = fh.createReadStream();
                readStream.pipe(process.stdout);
            }
        );
    }
);


// const res = await duckDbQuery(con, `SELECT * FROM Persons`);
// console.log(res);
// await duckDbQuery(con, "SHOW ALL TABLES")
// con.all("SELECT * FROM Persons", function(err, res) {console.log(res)});
// con.all("SHOW TABLES", (err, res) => console.log(res));

// const jsonData = [
//   {"userId":1,"id":1,"title":"delectus aut autem","completed":false},
//   {"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
// ];

// const jsonData2 = [
//     {"userId":2,"id":1,"title":"delectus aut autem","completed":false},
//     {"userId":2,"id":2,"title":"quis ut nam facilis et officia qui","completed":false}
//   ];
  
// con.exec(`INSTALL arrow; LOAD arrow;`, (err) => {
//     if (err) {
//         console.warn(err);
//         return;
//     }

//     const arrowTable = tableFromJSON(jsonData.concat(jsonData2));
//     con.register_buffer("jsonDataTable", [tableToIPC(arrowTable)], true, (err) => {
//         if (err) {
//             console.warn(err); 
//             return;
//         }
//     con.exec("CREATE TABLE testTable AS SELECT * FROM jsonDataTable;");
//     });
// });

// output database file to stdout, so that Framework can cache its result.

