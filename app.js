/* jshint node:true */

'use strict';

var fs = require('fs');

var express = require('express');
var session = require('express-session');
var bcrypt = require('bcrypt');

var app = module.exports = express();

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'SECRET PANDA',
	view: 0
}));

app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// ワンタイムトークン用にハッシュ生成
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync(Math.random().toString(), salt);

app.get('/', function(req, res) {
	var sess = req.session;

	// 初回アクセス時ならワンタイムトークン発行
	if (sess.views) {
		// 発行済み
		sess.views++;
		res.render('error', {
			title: 'ONETIME PASSWORD',
			message: '既に！'
		});
	} else {
		var now = new Date();
		var timestamp = now.getTime();

		// トークンをファイル名にタイムスタンプを書き込んで保存
		fs.writeFile('./.onetime/' + hash, timestamp, function(err) {
			if (err) console.log(err);

			sess.views = 1;

			if (process.env.NODE_ENV === 'test') {
				res.end(hash);
			} else {

				res.render('onetime', {
					title: 'ONETIME PASSWORD',
					onetime: {
						token: hash
					}
				});
			}
		});
	}
});

app.get('/demo/', function(req, res) {
	// トークン認証しないとダメよ
	res.redirect('/');
});

app.get('/demo/:token', function(req, res) {
	var token = req.params.token;
	var file = './.onetime/' + token;

	fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
		// ファイルが存在しないということは無効なトークンである。
		if (err) {
			res.render('error', {
				title: 'ONETIME PASSWORD',
				message: '無効なトークンです。'
			});
			console.log(err);
		} else {
			var now = new Date();

			fs.unlink(file, function (err) {
				if (err) throw err;
				console.log('用済みなので消す');

				// 生成から10分以上経過してたらアウト
				if (now.getTime() - Number(data) > 60 * 60 * 10) {
					res.render('error', {
						title: 'ONETIME PASSWORD',
						message: 'トークンの有効時間が過ぎていますです。'
					});
				} else {
					res.render('demo', {
						title: 'SUCCESS!'
					});
				}
			});
		}
	});
});

app.listen(3002);
