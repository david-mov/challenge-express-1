var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
	clients: {},
	reset: function() {
		this.clients = {};
	},
	addAppointment: function(name, {date}) {
		if (!this.clients[name]) {
			this.clients[name] = [];
		}
		const obj = {
			date,
			status: 'pending'
		}
		this.clients[name].push(obj)
		return obj
	},
	attend: function(name, date) {
		const idx= this.clients[name].findIndex(obj => obj.date === date);
		if (idx === -1) return null
		this.clients[name][idx].status = 'attended'
		return this.clients[name][idx]
	},
	expire: function(name, date) {
		const idx= this.clients[name].findIndex(obj => obj.date === date);
		if (idx === -1) return null
		this.clients[name][idx].status = 'expired'
		return this.clients[name][idx]
	},
	cancel: function(name, date) {
		const idx= this.clients[name].findIndex(obj => obj.date === date);
		if (idx === -1) return null
		this.clients[name][idx].status = 'cancelled'
		return this.clients[name][idx]
	},
	erase: function(name, condition) { // condition can be a date or a status
		const prop = parseInt(condition) ? 'date' : 'status'
		const filtered = []
		const erased = []
		for (el of this.clients[name]) {
			if (el[prop] !== condition) {
				filtered.push(el)
			} else {
				erased.push(el)
			}
		}
		this.clients[name] = filtered
		return erased
	},
	getAppointments: function(name, status) {
		if (status) {
			return this.clients[name].filter(obj => obj.status === status);
		} else {
			return this.clients[name];
		}
	},
	getClients: function() {
		let arr = [];
		for (client in this.clients) {
			arr.push(client);
		}
		return arr;
	}
};

server.use(bodyParser.json());

server.get('/api', (req,res) => {
	return res.send(model.clients)
})

server.post('/api/Appointments', (req,res) => {
	const {appointment, client} = req.body
	if (!client) {
		return res.status(400).send('the body must have a client property')
	}
	if (typeof client !== 'string') {
		return res.status(400).send('client must be a string')
	}
	const obj = model.addAppointment(client, appointment)
	return res.send(obj)
})

server.get('/api/Appointments/:name', (req,res) => {
	const {name} = req.params
	const {date, option} = req.query
	if (!model.clients[name]) {
		return res.status(400).send('the client does not exist')
	}
	if (option === 'attend') {
		const obj = model.attend(name, date)
		if (!obj) return res.status(400).send('the client does not have a appointment for that date')
		return res.status(200).send(obj)
	} else if (option === 'expire') {
		const obj = model.expire(name, date)
		if (!obj) return res.status(400).send('the client does not have a appointment for that date')
		return res.status(200).send(obj)
	} else if (option === 'cancel') {
		const obj = model.cancel(name, date)
		if (!obj) return res.status(400).send('the client does not have a appointment for that date')
		return res.status(200).send(obj)
	} else {
		return res.status(400).send('the option must be attend, expire or cancel')
	}
})

server.get('/api/Appointments/:name/erase', (req, res) => {
	const {name} = req.params
	const {date, status} = req.query
	if (!model.clients[name]) {
		return res.status(400).send('the client does not exist')
	}
	const erased = model.erase(name, date || status)
	return res.send(erased)
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
	return res.send(model.getAppointments(req.params.name))
})

server.get('/api/Appointments/clients', (req, res) => {
	return res.status(200).send(model.getClients())
})

server.listen(6000);
module.exports = { model, server };
