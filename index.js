const express = require("express");
const req = require("express/lib/request");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();


//inicia conexão com o banco
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successfull connection to database 'apptest.db'");
});

const sql_create =
    `CREATE TABLE IF NOT EXISTS Ramais (
    Ramal_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Numero VARCHAR(4) NOT NULL,
    Serial VARCHAR(100) NOT NULL
    );`;

// const sql_createMov =
//     `CREATE TABLE IF NOT EXISTS Movimentacoes(
//         Movimentacao_ID INTEGER PRIMARY KEY AUTOINCREMENT,
//         Numero VARCHAR(4) NOT NULL,
//         NF_Saida VARCHAR NOT NULL,
//         NF_Entrada VARCHAR NOT NULL,
//         Data DATE,
//         CONSTRAINT fk_Ramais
//         FOREIGN KEY(Numero) REFERENCES Ramais(Numero)
//     );`;

db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Tabela Ramais criada com sucesso");
});

// db.run(sql_createMov, err => {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log("Tabela Movimentações criada com sucesso");
// });
// const sql_insert = `INSERT INTO Ramais (Ramal_ID, Numero, Serial, Comments) VALUES
// (1, '9867', 'GK2YHKJSA', 'Ramal está em manutenção'),
// (2, '9845', 'LUYJHKLLO', 'Ramal está no setor'),
// (3, '6789', 'ILKJHKJSA', 'Ramal está quebrado aguandando envio');`;

// db.run(sql_insert, err => {
//     if(err){
//         return console.error(err.message)
//     }
//     console.log("Ramais inseridos com sucessso")
// })




//inicia o express
const app = express();

//determina que a engine usada é ejs
app.set("view engine", "ejs");

//determina onde as views ejs estão
app.set("views", path.join(__dirname, "views"));

//determina que arquivos estaticos estão dentro da public "css"
app.use(express.static(path.join(__dirname, "/public")));

//middleware config
app.use(express.urlencoded({ extended: false }))



app.listen(3000, () => {
    {
        console.log("Server started (http://localhost:3000/) !");
    }
});

app.get("/", (req, res) => {
    //res.send ("Hello .")
    res.render("index.ejs");

});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/data", (req, res) => {
    const test = {
        title: "test",
        items: ["one", "two", "three"]
    };
    res.render("data", { model: test });
});

app.get("/ramais", (req, res) => {
    const sql = "SELECT * FROM Ramais"
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("ramais", { model: rows })
    });
});

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Ramais where Ramal_ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("edit", { model: row });

    });
});

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const ramal = [req.body.Numero, req.body.Serial, id];
    const sql = `UPDATE Ramais SET Numero = ?, Serial = ? WHERE (Ramal_ID = ?);`;

    db.run(sql, ramal, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/ramais");

    })
})

app.get("/create", (req, res) => {
    res.render("create", { model: {} });
})


app.post("/create", (req, res) => {
    const sql = "INSERT INTO Ramais (Numero, Serial) VALUES (?,?)";
    const ramal = [req.body.Numero, req.body.Serial];
    db.run(sql, ramal, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/ramais")
    })
})


app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Ramais WHERE Ramal_ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("delete", { model: row })
    })

})

app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Ramais WHERE Ramal_ID=?";
    db.run(sql, id, err => {
        if (err) {
            return console.error(err.message)
        }
        res.redirect("/ramais")
    })
})

