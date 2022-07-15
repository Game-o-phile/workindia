const db = require('../database');
const Cryptr = require('cryptr');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const key = new Cryptr("This is the secret key");

const generateNumber = (first, second) => {
    return JSON.stringify(Math.floor(first + Math.random() * second));
}

const createBankAccountService = async (email_id, name, dob, aadhar_number, pancard_number, address) => {
    try {

        const accountNumber = generateNumber(1000000000000000, 9000000000000000);
        const pin = generateNumber(1000, 9000);

        const encryptedPin = key.encrypt(pin);

        await db.promise().query(`
            INSERT INTO BankAccount values (${JSON.stringify(email_id)}, ${JSON.stringify(name)}, ${JSON.stringify(dob)}, ${JSON.stringify(aadhar_number)}, ${JSON.stringify(pancard_number)}, ${JSON.stringify(address)}, ${JSON.stringify(encryptedPin)}, ${accountNumber});
        `);

        await db.promise().query(`
            insert into AccountDetails values (${accountNumber}, ${0.0}, ${null});
        `)

        return {
            success: true,
            status: 'Account successfully created', json_data: {
                "pin": pin,
                "account_number": accountNumber
            },
            status_code: 201
        }
    } catch (err) {
        return { error: err, status_code: 400 };
    }
}

const accountLoginService = async (username, pin) => {
    try {

        // const entryExists = await db.promise().query(`
        //     SELECT * FROM BankAccount WHERE EXISTS (SELECT * FROM BankAccount WHERE username=${JSON.stringify(username)} AND pin=${JSON.stringify(encryptedPin)});
        // `)

        const entryExists1 = await db.promise().query(`
            SELECT * FROM BankAccount WHERE username=${JSON.stringify(username)};
        `)

        if (entryExists1[0].length) {

            const decryptedPin = entryExists1[0][0].pin;

            const entryExists = await db.promise().query(`
                SELECT * FROM BankAccount WHERE EXISTS (SELECT * FROM BankAccount WHERE username=${JSON.stringify(username)} AND pin=${JSON.stringify(decryptedPin)});
            `)

            if (entryExists[0].length) {
                const acno = entryExists[0][0].accountNumber;

                const jwtToken = jwt.sign({ accountNumber: acno, admin: true }, process.env.SECRET_KEY);

                return {
                    success: true,
                    status: 'success',
                    username: username,
                    token: jwtToken,
                    status_code: 200
                }
            }
            else {
                return {
                    status: "Incorrect username/password provided. Please retry",
                    status_code: 401
                }
            }
        }
        else {
            return {
                status: "Incorrect username/password provided. Please retry",
                status_code: 401
            }
        }
    } catch (err) {
        return {
            error: err,
            status: "Incorrect username/password provided. Please retry",
            status_code: 401
        }
    }
}

const accountBalanceService = async (accountNumber) => {

    try {
        const query = await db.promise().query(`
            SELECT balance, last_transaction_timestamp FROM AccountDetails WHERE accountNumber=${JSON.stringify(accountNumber)};
        `);

        return {
            success: true,
            account_number: accountNumber,
            balance: query[0][0].balance,
            account_state: "ACTIVE",
            last_transaction_timestamp: query[0][0].last_transaction_timestamp
        }
    } catch (err) {
        return { error: err, status_code: 400 };
    }
}

const addMoneyService = async (amount, transaction_mode) => {
    try {

        const tokenData = jwt.verify(token, process.env.SECRET_KEY);

        console.log(tokenData);

        let sum = await db.promise().query(`
            select balance from AccountDetails where accountNumber=${tokenData.accountNumber};
        `);

        sum = sum[0][0].balance;

        await db.promise().query(`
            UPDATE AccountDetails set balance=${sum + amount} WHERE accountNumber=${tokenData.accountNumber};
        `);

        return {
            success: true,
            status: "Transaction happened successfully",
            mode: transaction_mode,
            status_code: 200
        }
    } catch (err) {
        return { error: err, status_code: 400 };
    }
}

const transferMoneyService = async (to, from, amount, tname, tmode) => {
    try {

        const tokenData = jwt.verify(token, process.env.SECRET_KEY);

        console.log(tokenData);

        //deduct amount
        let sum = await db.promise().query(`
            select balance from AccountDetails where accountNumber=${tokenData.accountNumber};
        `);

        sum = sum[0][0].balance;

        await db.promise().query(`
            UPDATE AccountDetails set balance=${sum - amount} WHERE accountNumber=${tokenData.accountNumber};
        `);

        //add amount
        const receiver = await db.promise().query(`
            select accountNumber from BankAccount where username=${to};
        `);

        sum = await db.promise().query(`
            select balance from AccountDetails where accountNumber=${receiver[0][0].accountNumber};
        `);

        await db.promise().query(`
            UPDATE AccountDetails set balance=${sum + amount} WHERE accountNumber=${receiver[0][0].accountNumber};
        `);

        //add transaction to db
        await db.promise().query(`
            insert into transactions values (${JSON.stringify(tmode)}, ${JSON.stringify(new Date().getTime())}, ${JSON.stringify(to)}, ${JSON.stringify(from)}, ${amount}, ${tname});
        `);

        return {
            success: true,
            'status': 'Transaction happened successfully',
            'status_code': 200
        }

    } catch (err) {
        return { error: err, status_code: 400 };
    }

}

const listTransactionsService = async (start, end, sort) => {
    try {

        start = JSON.stringify(start.getTime());
        end = JSON.stringify(end.getTime());

        const query = await db.promise().query(`
            select * from transactions where timestamp >= ${start} and timestamp <= ${end} order by timestamp ${sort};
        `);

        return {
            success: true,
            result: query[0][0]
        }
    } catch (err) {
        return { error: err, status_code: 400 };
    }
}

module.exports = { createBankAccountService, accountLoginService, accountBalanceService, addMoneyService, transferMoneyService, listTransactionsService }