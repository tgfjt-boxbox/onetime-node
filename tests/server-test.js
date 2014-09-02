var app = require('../app');

var request = require('supertest').agent(app.listen());

var should = require('should');

var token;




describe('toppage', function() {
	describe('when GET /', function() {
		it('should return the toppage', function(done) {
			request
				.get('/')
				.expect(200, function(err, res) {
					if (err) {
						return done(err);
					}

					token = res.text;

					res.text.should.containEql('$2a');
					done();
				});
		});
	});
});


describe('demo/$token', function() {
	describe('with invalid token', function() {
		it('should return error', function(done) {
			request
				.get('/demo/$token')
				.expect(200, function(err, res) {
					if (err) {
						return done(err);
					}

					res.should.be.html;
					res.text.should.containEql('<p>無効なトークンです。</p>');
					done();
				});
		});
	});

	describe('with valid token', function() {
		it('should return success', function(done) {
			request
				.get('/demo/' + token)
				.expect(200, function(err, res) {
					if (err) {
						return done(err);
					}

					res.should.be.html;
					res.text.should.containEql('<p>認証が完了した的な感じです。</p>');
					done();
				});
		});
	});
});


describe('demo', function() {
	describe('when GET /demo', function() {
		it('should redirect root', function(done) {
			request
				.get('/demo')
				.end(function(err, res) {
					res.header['location'].should.containEql('/');
					done();
				});
		});
	});
});
