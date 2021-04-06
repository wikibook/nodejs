var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

module.exports = function (passport) {
    router.get('/login', function(request, response) {
        var fmsg = request.flash();
        var feedback = '';
        if(fmsg.error) {
            feedback = fmsg.error[0];
        }
        var title = 'WEB - login';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
            <div style="color:red;">${feedback}</div>
            <form action="/auth/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p>
                    <input type="submit" value="login">
                </p>
            </form>
        `, '');
        response.send(html);
    });

    router.post('/login_process', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
        successFlash: true
    }));

    router.get('/register', function (request, response) {
        var fmsg = request.flash();
        var feedback = '';
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        var title = 'WEB - login';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
            <div style="color:red;">${feedback}</div>
            <form action="/auth/register_process" method="post">
                <p><input type="text" name="email" placeholder="email" value="egoing7777@gmail.com"></p>
                <p><input type="password" name="pwd" placeholder="password" value="111111"></p>
                <p><input type="password" name="pwd2" placeholder="password" value="111111"></p>
                <p><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
                <p>
                    <input type="submit" value="register">
                </p>
            </form>
        `, '');
        response.send(html);
    });

    router.get('/logout', function (request, response) {
        request.logout();
        request.session.destroy(function(err) {
            response.redirect('/');
        });
    });

    return router;
}
