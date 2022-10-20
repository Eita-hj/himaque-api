'use strict';
const { EventEmitter } = require("node:events");
const OptionBits = require("../structures/OptionBits")
const { api } = require("../utils/")

module.exports = class Client extends EventEmitter {
	constructor(options) {
		super();
		this.id = "";
		this.pass = "";
		this.users = require("../managers/UserManager");
		this.guilds = require("../managers/GuildManager");
		if (options.option == undefined) throw new Error("Option is invalid.")
		this.secret = {
			id: undefined,
			key: undefined,
			options: OptionBits.set(options.option),
			logined: false,
			chatload: false
		};
	}
	async login(id = this.id, pass = this.pass) {
		if (this.secret.logined) throw new Error("Already Logined.")
		this.emit("debug", "[Debug] Login Requested.")
		this.emit("debug", `[Debug] Recieved ID:${id.slice(0,2)}${id.slice(2).replace(/./g, "*")} Recieved PASS:${pass.slice(0,2)}${pass.slice(2).replace(/./g, "*")}`)
		if (!id || !pass) throw new Error("ID or PASS is invalid.(Error Code 100)");
		if (!id.match(/^[a-z0-9]{4,20}$/) || !pass.match(/^[a-z0-9]{4,20}$/))
			return new Error("ID or PASS is invalid.(Error Code 101)");
		const result = await api.post(api.links.Login, {
			fid: id,
			fpass: pass,
			hkey: 1,
		});
		if (result.error == 2) {
			throw new Error("ID or PASS is wrong. (Error Code 102)");
		} else if (result.error == 404) {
			throw new Error("ERROR 404 (Banned.)");
		} else {
			this.secret.logined = true
			this.secret.id = result.userid;
			this.secret.key = result.seskey;
			this.guilds = new this.guilds(this);
			this.users = new this.users(this);
			this.user = await this.users.fetch(result.userid);
			this.guild = this.user.guild;
			this.emit("ready", this);
			this.logined = true
			const { startload } = require("../collectors/BaseChatCollector");
			startload(this, result.kbmark);

			return true;
		}
	}
	async logout(post = false){
		if (!this.secret.logined) throw new Error("Already Logouted.")
		this.emit("debug", "[Debug] Logout Requested.")
		this.secret.chatload = false
		if (post) await api.post(api.links.logout, {
			marumie: this.secret.id,
			seskey: this.secret.key
		})
		this.secret.id = "";
		this.secret.key = "";
		this.users = require("../managers/UserManager");
		this.guilds = require("../managers/GuildManager");
		this.secret.logined = false;
		this.emit("debug", "[Debug] Logouted.");
		return;
	}
}
