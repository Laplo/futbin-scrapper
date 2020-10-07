const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 54320,
});
const fetch = require('node-fetch');
(async () => {
    await client.connect();
    const selectResponse = await client.query('SELECT MAX(id) as countPlayers FROM players');
    let counter = selectResponse.rows[0]['countplayers'];
    let countErr = 0;
    while (counter < 30000 && countErr < 250) {
        await fetch('http://localhost:4100/?playerId=' + ++counter)
            .then(fetchResponse => {
                if (!fetchResponse.ok) {
                    throw new Error("Not found")
                }
                return fetchResponse.json();
            })
            .then(async ({name, price, ranked}) => {
                console.log({name, ranked});
                const parameters = [counter, name, ranked];
                console.log(parameters);
                const res = await client.query('INSERT INTO players (id, name, ranked) VALUES ($1, $2, $3) returning *', parameters);
                console.log(res.rows[0], 'inserted');
            })
            .catch(err => {
                console.error(err);
                countErr++;
            });
    }
    await client.end();
})();
