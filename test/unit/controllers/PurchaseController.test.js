'use strict';

var data = require('../../datatest.js');
var assert = require('assert');
var request = require('supertest');
var agent;

describe('PurchaseController', function() {

  // Before: Instantiate an user agent
  before(function(done) {
    agent = request.agent(sails.hooks.http.app);
    done();
  });

  /**
  * Add a Purchase as a manager User
  */
  describe('#add() as a manager User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .expect(200)
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .expect(200)
      .end(done);
    });

    // Test
    it('As a manager User, should create a Purchase with 2 Products', function (done) {
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        agent
        .post('/purchase')
        .send({
          products: [
            {product: data.product_01.id, quantity: 100, unitPrice: 1},
            {product: data.product_02.id, quantity: 75, unitPrice: 1},
            {product: data.product_03.id, quantity: 80, unitPrice: 1},
            //{product: data.product_02.id, quantity: 15, unitPrice: 1},   //currently ignored because of concurrent access to the resource
            {product: data.product_04.id, quantity: 99, unitPrice: 1}
          ]
        })
        .expect(200)
        .end(function() {
          Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
            assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity + 100, 'Wrong quantity of product_01');
            assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity + 75,  'Wrong quantity of product_02');
            assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity + 80,  'Wrong quantity of product_03');
            assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity + 99,  'Wrong quantity of product_04');
            done();
          });
        });
      });
    });
  });


  /**
  * Add as a regular user
  */
  describe('#add() as a regular User', function() {

    // Before: Log in as a regular user
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_01.email,
        password: data.user_customer_01.password
      })
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular user, can\'t create a Purchase', function (done) {
      agent
      .post('/purchase')
      .send({
        // purchaseDate is optionnal
        // manager is optionnal
        products: [
          {product: data.product_01.id, quantity: 1},
          {product: data.product_02.id, quantity: 12}
        ]
      })
      .expect(401)
      .end(done);
    });
  });

  describe('#update() as a manager User', function() {

    // Before: Log in as a manager User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });

    // Before: Get a created Purchase's Id
    var purchaseId;
    before(function(done) {
      Purchase
      .find()
      .limit(1)
      .exec(function(err, foundPurchases) {
        if(err) {
          done(err);
        }
        else {
          purchaseId = foundPurchases[0].id;
          done();
        }
      });
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, update a created Purchase', function (done) {
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        agent
        .patch('/purchase/2')
        .send({
          products: [
            // remove {product: data.product_02.id, quantity: 11, unitPrice: 1}
            {product: data.product_01.id, quantity: 10, unitPrice: 1}
            // remove {product: data.product_03.id, quantity: 3, unitPrice: 1}
          ]
        })
        .expect(200)
        .end(function() {
          Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
            assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity + 10, 'Wrong quantity of product_01');
            assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity - 11, 'Wrong quantity of product_02');
            assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity - 3 , 'Wrong quantity of product_03');
            assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity,      'Wrong quantity of product_04');
            done();
          });
        });
      });
    });
  });

  describe('#delete() as a regular User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_customer_01.email,
        password: data.user_customer_01.password
      })
      .end(done);
    });

    // Before: Get a created Purchase's Id
    var purchaseId;
    before(function(done) {
      Purchase
      .find()
      .limit(1)
      .exec(function(err, foundPurchases) {
        if(err) {
          done(err);
        }
        else {
          purchaseId = foundPurchases[0].id;
          done();
        }
      });
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a regular User, can\'t delete a Purchase', function (done) {
      agent
      .delete('/purchase/' + purchaseId)
      .expect(401, done);
    });
  });


  describe('#delete() as a manager User', function() {

    // Before: Log in as a regular User
    before(function(done){
      agent
      .put('/user/login')
      .send({
        email: data.user_manager_01.email,
        password: data.user_manager_01.password
      })
      .end(done);
    });

    // After: Log out
    after(function(done) {
      agent
      .put('/user/logout')
      .end(done);
    });

    // Test
    it('As a manager User, delete a Purchase', function (done) {
      Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsBefore){
        agent
        .delete('/purchase/3')
        .expect(200)
        .end(function() {
          Product.find([{id: data.product_01.id},{id: data.product_02.id},{id: data.product_03.id},{id: data.product_04.id}], function(err,productsAfter){
            assert.equal(productsAfter[0].quantity,  productsBefore[0].quantity,     'Wrong quantity of product_01');
            assert.equal(productsAfter[1].quantity,  productsBefore[1].quantity,     'Wrong quantity of product_02');
            assert.equal(productsAfter[2].quantity,  productsBefore[2].quantity,     'Wrong quantity of product_03');
            assert.equal(productsAfter[3].quantity,  productsBefore[3].quantity - 1, 'Wrong quantity of product_04');
            done();
          });
        });
      });
    });
  });

});
