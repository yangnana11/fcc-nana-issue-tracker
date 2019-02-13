/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {    
  
  const issueSchema = new mongoose.Schema({
    issue_project: {
      type: String,
      required: true
    },
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String
    },
    status_text: {
      type: String
    },
    open: {
      type: Boolean,
      default: 1
    },
    created_on: {
      type: Date,
      default: Date.now
    },
    updated_on: {
      type: Date,
      default: null
    }
  }, {
    versionKey: false // You should be aware of the outcome after set to false
  });
  var Issue = mongoose.model('Issue',issueSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;      
      let findArray = {issue_project: project};
      if (Object.entries(req.query).length !== 0) {        
        for (let item in req.query) {
          findArray[item] = req.query[item];
        }        
      }      
      const query = Issue.find(findArray);
      query.select('-issue_project')
      .exec((err,result) => {err ? res.json(err) : res.json(result)});
    })
    
    .post(function (req, res){
      var project = req.params.project;
      let {issue_title ,issue_text, created_by, assigned_to, status_text} = req.body;    
      if (issue_title.length==0 || issue_text.length ==0 || created_by.length==0) {
        res.status(500);
        res.json();
        return;
      }
      let newIs = new Issue({
        issue_project: project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      });
      newIs.save((err,result)=> {
        if (err) {
          res.json(err);
        } else {
          // res.json(result);
          const query = Issue.find({issue_project: project});
          query.select('-issue_project')
          .exec((err,result) => {err ? res.json(err) : res.json(result)});
        }
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      if (Object.entries(req.body).length === 0 && req.body.constructor === Object) {
        res.status(500);
        res.json();
        return;
      }
      let {_id} = req.body;      
      let update_array = {_id};
      if (req.body.hasOwnProperty('open')) {
        let {open} = req.body;
        update_array.open = open;
      } else {
        update_array.open = true;
      }
      if (req.body.hasOwnProperty('issue_title')) {
        let {issue_title} = req.body;
        if (issue_title.length > 0) {
          update_array.issue_title = issue_title;
        }
      }
      if (req.body.hasOwnProperty('issue_text')) {
        let {issue_text} = req.body;
        if (issue_text.length > 0) {
          update_array.issue_text = issue_text;
        }
      }
      if (req.body.hasOwnProperty('created_by')) {
        let {created_by} = req.body;
        if (created_by.length > 0) {
          update_array.created_by = created_by;
        }
      }
      if (req.body.hasOwnProperty('assigned_to')) {
        let {assigned_to} = req.body;
        if (assigned_to.length > 0) {
          update_array.assigned_to = assigned_to;
        }
      }
      if (req.body.hasOwnProperty('status_text')) {
        let {status_text} = req.body;
        if (status_text.length > 0) {
          update_array.status_text = status_text;
        }
      }
      update_array.updated_on = new Date().toISOString();      
      Issue.findOneAndUpdate({issue_project: project, _id}, update_array, (err, result)=> {
        if (err) {
          res.json(err);
        } else {
          const query = Issue.find({issue_project: project});
          query.select('-issue_project')
          .exec((err,result) => {err ? res.json(err) : res.json(result)});
        }
      });      
    })
    
    .delete(function (req, res){
      var project = req.params.project;      
      let {_id} = req.body;
      Issue.findByIdAndDelete(_id, (err,result) => {
        if (err) {
          res.json(err);
        } else {
          const query = Issue.find({issue_project: project});
          query.select('-issue_project')
          .exec((err,result) => {err ? res.json(err) : res.json(result)});
        }
      });
    });
    
};
