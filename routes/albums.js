//list dependencies
var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),// db dependency
	Album = require('../models/album'),// model dependency

	// file upload dependencies
	formidable = require('formidable'), 
	util = require('util'),
	fs = require('fs-extra');


// GET - show all albums
router.get('/albums',function(req,res,next){
	Album.find(function(err,albums){
		if(err){// if there's an error, show this
			res.render('error',{error:err});
		} else {// if there is no error, load the albums
			res.render('albums',{albums:albums});
			console.log(albums);
			res.end();	
		}
	});
});
	

// GET - show album by id
/*
router.get('/albums/:id', function(req, res, next) {
	Album.findById(function(err, albums) {
		if(err) {
			res.render('error', {error:err});
		} else {
			res.render('album', {albums: albums});
		}
	});
});
*/
// couldn't figure this out. it rendered the add page?

// show the add page
router.get('/albums/add', function (req, res, next) {
    res.render('add');
});

// POST - this bit is used for adding an album to the database
router.post('/albums/add', function (req, res, next) {
	// this allows use of the formidable package
	var form = new formidable.IncomingForm;
	// this intreprets the form vlues
	form.parse(req, function (err, fields, files) {
		//res.writeHead(200);
		//res.write('file uploded\n');
		//res.end(util.inspect({fields:fields ,files:files}));
	});

	// empty variables to store the values
	var id, title, artist, price, label, notes;

	form.on('field', function (name, value) {
		if (name == 'title') {
			title = value;
		} else if (name == 'artist') {
			artist = value;
		} else if (name == 'price') {
			price = value;
		} else if (name == 'label') {
			label = value;
		} else if (name == 'notes') {
			notes = value;
		}
	});

	// finish uploading the image
	form.on('end', function (fields, files) {
		var temp_path = this.openedFiles[0].path,
			file_name = this.openedFiles[0].name,
			new_location = 'public/images/';

		fs.copy(temp_path, new_location + file_name, function (err) {
			if(err) {
				res.render('error', {error:err});
				res.end('image upload error');
			} else {// creates the object from the input values
				Album.create({
					title: title,
					artist: artist,
					price: price,
					label: label,
					notes: notes,
					imgurl: '/images/' + file_name
				},
				function (err, album) {
					if(err) {
						console.log(err);
						res.render('error', {error:err});
					} else {// if successful, sends user to a confirmation page
						console.log('Album Saved' + Album);
						res.render('added', {album : album.title});
						res.end();
					}
				}
				);
			}
		});
	});
});

	// API GET - handles album requests
router.get('/api/albums', function(req,res,next){
	
	Album.find(function (err,album) {
		if(err) {
			res.send(err);
		} else {
			res.send(album);
		}
	});
});

router.get('/api/albums/:id', function(req,res,next){
	var id = req.params.id;

	var album = {
		_id:req.body.id,
		title: req.body.title,
		artist: req.body.artist,
		price: req.body.price,
		label: req.body.label,
		notes: req.body.notes
	};
	Album.findById(id, function (err,album) {
		if(err) {
			res.send(err);
		} else {
			res.send({album:album});
		}
	});
});

// GET - this bit deletes the album
router.get('/albums/delete/:id', function (req,res,next) {
	// stores the id in a variable
	var id = req.params.id;
	
	// this deletes the object based on its id
	Album.remove({_id : id},
	function (err,Album){ 
		if(err) {
			res.send('Album' +id +'not found');
		} else {
	   		// redirects user back to the list
	   		res.statusCode = 302;
	   		res.setHeader('Location','http://'+req.headers['host']+'/albums');
			//res.redirect('/albums');
			res.end();
	   	}	
	});
});

// GET - gets a form to edit the selected object
router.get('/albums/edit/:id', function (req,res,next){
	// stores the id in a variable
	var id = req.params.id;
	// find the specific obect by its id
	Album.findById(id, function (err, Album){
		if(err) {
			res.send('Album' +id +'not found');
		} else {// sends user to the edit form
		 	console.log(Album);
		 	res.render('edit',{album:Album});
		}	
	});
});

// POST - this updates the object
router.post('/albums/edit/:id', function(req,res,next){
	// stores object variable as a Json object
	var album = {
		_id:req.body.id,
		title: req.body.title,
		artist: req.body.artist,
		price: req.body.price,
		label: req.body.label,
		notes: req.body.notes
	}
	// this actually updates the object
	Album.update({_id:req.body.id}, album, function (err,Album) {
		if(err) {
			console.log(err);
			res.send('Album not updated');
		} else {// sends user back to the list
			res.statusCode = 302;
			res.setHeader('Location','http://'+req.headers['host']+'/albums');
			res.end();
		}
	});
});


//make the controller public
module.exports = router;