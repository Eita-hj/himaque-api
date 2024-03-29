const {api, convtext} = require("../utils/")
const BaseManager = require("./BaseManager")
const GuildBBS = require("../structures/GuildBBS")

module.exports = class BBSGetter extends BaseManager {
	constructor(client){
		super(client)
			if (!client.secret.caches.has(1n << 2n)) delete this.cache
	}
	async exists(id){
		const data = await api.post(api.links.Guild.BBS.Window, {
			marumie: this.client.secret.id,
			seskey: this.client.secret.key,
			bbsid: id,
			page: 1
		})
		return data.error !== 99
	}
	async getable(id){
		const data = await api.post(api.links.Guild.BBS.Window, {
			marumie: this.client.secret.id,
			seskey: this.client.secret.key,
			bbsid: id,
			page: 1
		})
		return !(data === "メンバーでない" || data.error === 99)
	}
	async fetch(id){
		if (!(typeof Number(id) === "number" && Number.isInteger(Number(id)) && Number(id) > 0)) throw new TypeError(`${id} is invalid of BBS id.`)
		const f = await api.post(api.links.Guild.BBS.Window, {
			origin: "himaque",
			myid: this.client.secret.id,
			seskey: this.client.secret.key,
			bbsid: id,
			page: 1
		})
		if (f.str === "誰おま" || f.str === "存在しないBBS") return null
		const r = {}
		r.id = String(id)
		r.title = convtext(f.title)
		r.authorid = f.created_userid
		r.author = await this.client.users.get(Number(r.authorid))
		//const t = source.split(`style='color:#0000EE;cursor:pointer;font-size:11px;'>${authorid}</span>　`)[1].split("</div>")[0]
		//r.createdTimestamp = Date.parse(t.split("-").join("/"))
		//r.createdAt = new Date(r.createdTimestamp)
		const BBS = new GuildBBS(r, this.client)
		if (this.client.secret.caches.has(1n << 2n)) this.cache.set(String(BBS.id), BBS)
		return BBS
	}
	get(id){
		return this.cache?.has?.(String(id)) ? this.cache.get(String(id)) : this.fetch(String(id))
	}
}
