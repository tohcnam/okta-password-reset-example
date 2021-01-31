const express = require('express');
const app =  express();
const dotenv = require('dotenv');
dotenv.config();
app.use(express.urlencoded({ extended: true }));

var OktaAuth = require('@okta/okta-auth-js').OktaAuth;
var authClient = new OktaAuth({
    issuer: 'YourOktaURL'
}); 

app.get('/', (req, res) => {
    res.send(`
        <h1>Forgot Password index page</h1>
        <p>Did you forgot your password? Enter your username and click on send.</p>
        <form action="/forgot-password" method="post">
            <label for="username">Username</label><br>
            <input type="text" id="username" name="username" value=""><br>
            <input type="submit" value="Submit">
        </form> 
    `);
});

app.post('/forgot-password', (req, res) => {
    console.log(req.body.username);
    if(req.body.username){
        let username = req.body.username;
        authClient.forgotPassword({
            username: username,
            factorType: 'EMAIL'
        })
        .then(function(transaction){
            console.log(transaction.status);
            if(transaction.status == 'RECOVERY_CHALLENGE'){
                res.send('<p>A link was sent to your email. Please click on that link to reset your password.</p>');
            } else {
                res.send('<p>Something went wrong, please contact your Administrator.</p>');
            }
        })
        .catch(function(err) {
            console.error(err);
        });
    }
    else
     res.send('<p>error</p>');
});

app.get('/reset-password/:recoveryToken', (req, res) => {
    if(req.params.recoveryToken){
        let recoveryToken = req.params.recoveryToken;
        res.send(`
            <form action="/reset-password" method="post">
                <label for="password">Enter new Password</label><br>
                <input type="password" id="password" name="password" value=""><br>
                <input type="hidden" id="recoveryToken" name="recoveryToken" value="${recoveryToken}">
                <input type="submit" value="Submit">
            </form> `
        );
    } else {
        res.send('something went wrong');
    }
});

app.post('/reset-password', async (req, res) => {
    console.log(req.body);
    if(req.body.recoveryToken && req.body.password){
        let recoveryToken = req.body.recoveryToken;
        let password = req.body.password;
        await authClient.verifyRecoveryToken({
            recoveryToken: recoveryToken
        }).then(function(transaction) {
            console.log(transaction.status);
            transaction.resetPassword({
                newPassword: password
            });
            console.log(transaction);
            res.send('<p>Password reset successfully</p>')
        }).catch(function(err){
            console.error(err);
        });
    } else {
        res.send('something went wrong');
    }
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port '+ port));