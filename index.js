const express = require('express');
const cors = require('cors');
const { getStats, storeMutation } = require('./db');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

function hasMutation(dna) {
    const n = dna.length;
    const m = dna[0].length;

    //check if the matrix has a valid size
    if (n < 4 || m < 4) {
        throw new Error('La matriz debe tener un tamaño mínimo de 4x4');
    }

    // check if the matrix has valid characters
    const validChars = ['A', 'T', 'C', 'G'];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (!validChars.includes(dna[i][j])) {
                return false;
            }
        }
    }

    // check mutation in rows
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= m - 4; j++) {
            if (
                dna[i][j] === dna[i][j + 1] &&
                dna[i][j] === dna[i][j + 2] &&
                dna[i][j] === dna[i][j + 3]
            ) {
                return true;
            }
        }
    }

    // check mutation in columns
    for (let i = 0; i <= n - 4; i++) {
        for (let j = 0; j < m; j++) {
            if (
                dna[i][j] === dna[i + 1][j] &&
                dna[i][j] === dna[i + 2][j] &&
                dna[i][j] === dna[i + 3][j]
            ) {
                return true;
            }
        }
    }

    // check mutation in diagonals
    for (let i = 0; i <= n - 4; i++) {
        for (let j = 0; j <= m - 4; j++) {
            if (
                dna[i][j] === dna[i + 1][j + 1] &&
                dna[i][j] === dna[i + 2][j + 2] &&
                dna[i][j] === dna[i + 3][j + 3]
            ) {
                return true;
            }
            if (
                dna[i][j + 3] === dna[i + 1][j + 2] &&
                dna[i][j + 3] === dna[i + 2][j + 1] &&
                dna[i][j + 3] === dna[i + 3][j]
            ) {
                return true;
            }
        }
    }

    return false;
}


app.post('/mutation', async (req, res) => {
    try {
        const dna = req.body.dna;
        const mutation = hasMutation(dna);
        await storeMutation(dna, mutation);
        console.log(mutation)
        mutation ? res.status(200).send() : res.status(403).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/stats', async (req, res) => {
    try {
        let stats = await getStats();
        console.log(stats)
        stats = { ...stats, ratio: stats.count_no_mutation / stats.count_mutations };
        res.status(200).json(stats);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;