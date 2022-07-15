const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.post('/admin/bankaccount', userController.createBankAccount);
router.post('/account/login', userController.accountLogin);
router.get('/account/balance', userController.accountBalance);
router.post('/account/transaction/add', userController.addMoney);
router.post('/account/transaction/transfer', userController.transferMoney);
router.get('/account/transactions', userController.listTransactions);


module.exports = router;