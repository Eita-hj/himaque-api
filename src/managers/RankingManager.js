const { api, convtext } = require("../utils/");
const Cache = require("../structures/Cache");
const BaseManager = require("./BaseManager")
module.exports = class RankingManager extends BaseManager {
	constructor(client){
		super(client)
		if (!client.secret.caches.has(1n << 6n)) delete this.cache
	}
	async fetch(ranking) {
		let result = new Cache(),
			temp = new Array();
		let { source } = await api.post(api.links.Ranking);
		source = source
			.split("<BR>")
			.join("<br>")
			.split("\t")
			.join("")
			.split("\r\n")
			.join("")
			.split("<tr><td>");
		source.shift();
		for (let i = 0; i < source.length; i++) {
			temp = source[i].split("</td><td>");
			const obj = new Object();
			const id = String(
				temp[2].split("<small style='color:#AAAAAA'>")[1].split("</small>")[0]
			);
			obj.user = {
				name: convtext(temp[2].split("<small style='color:#AAAAAA'>")[0]),
				id: id,
			};
			obj.mission = temp[3];
			obj.date = temp[4].split("</td></tr>")[0];
			result.set(temp[0], obj);
		}
		if (this.client){
			if (this.client.secret.caches.has(1n << 6n)) this.cache = result.clone()
		}
		if (ranking){
			const data = result.get(ranking.toString())
			if (this.userFetch && this.client) data.user = await this.client.users.get(data.user.id)
			return;
		}
		return result;
	}
	get(ranking){
		if (ranking){
			return this?.cache?.size ? this.cache : this.fetch()
		} else {
			return this.cache.has(ranking) ? this.cache.get(ranking) : this.fetch(ranking)
		}
	}
}
