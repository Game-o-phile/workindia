const userService = require('../services/user.service');

const createBankAccount = async (req, res) => {

    if (req && req.body) {
        const {
            email_id,
            name,
            dob,
            aadhar_number,
            pancard_number,
            address
        } = req.body

        const response = await userService.createBankAccountService(email_id, name, dob, aadhar_number, pancard_number, address);

        if (response.success) {
            res.status(201).send(response);
        }
        else {
            res.status(400).send(response);
        }
    }
}

const accountLogin = async (req, res) => {

    if (req && req.body) {
        const {
            username,
            pin
        } = req.body;

        const response = await userService.accountLoginService(username, pin);

        if (response.success) {
            res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    }
}

const accountBalance = async (req, res) => {

    if (req && req.query) {

        const response = await userService.accountBalanceService(req.query.account_no);

        if (response.success) {
            res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    }
}

const addMoney = async (req, res) => {

    if (req && req.headers && req.headers.authorization && req.body) {

        const {
            amount,
            transaction_mode
        } = req.body;

        const response = await userService.addMoneyService(amount, transaction_mode);

        if (response.success) {
            res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    }
}

const transferMoney = async (req, res) => {
    if (req && req.headers && req.headers.authorization && req.body) {

        const {
            beneficiary_name,
            sender_name,
            amount,
            transaction_name,
            transaction_mode
        } = req.body;

        const response = await userService.transferMoneyService(beneficiary_name,
            sender_name,
            amount,
            transaction_name,
            transaction_mode
        );

        if (response.success) {
            res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    }
}

const listTransactions = async (req, res) => {
    if (req && req.query) {

        const response = await userService.listTransactionsService(req.query.start_date, req.query.end_date, req.query.sort_by_date);

        if (response.success) {
            res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    }
}

module.exports = { createBankAccount, accountLogin, accountBalance, addMoney, transferMoney, listTransactions };