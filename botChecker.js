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
    const selectResponse = await client.query('SELECT * FROM players_to_users WHERE email_sent = false');
    Promise.all(selectResponse.rows.map(async ({player_id, email, wished_price, superior}) => {
        return await fetch('http://localhost:4100/?playerId=' + player_id)
            .then(fetchResponse => fetchResponse.json())
            .then(({price}) => {
                if (price <= wished_price && !superior ||
                    price >= wished_price && superior) {
                    return ({player_id, email});
                }
            })
            .catch(err => console.error(err));
    })).then((res) => {
        // TODO : send mail
        // TODO : update en masse
        client.end();
    });
})();
