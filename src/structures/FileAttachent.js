const FormData = require("form-data")
const { api } = require("../utils/")

class FileAttachment {
	constructor(client, file, id){
		if (!client || !file) return
		this.data = new FormData()
		this.client = client
		this.data.append("MAX_FILE_SIZE", "2000000")
		this.data.append("marumie",`${client.secret.id}`)
		this.data.append("seskey",`${client.secret.key}`)
		const toBuffer = require("buffer-to-stream")
		const { createReadStream } = require("fs")
		const f = (typeof file == "string") ? createReadStream(file) : (Buffer.isBuffer(file)) ? toBuffer(file) : file
		if (f.size > 2000000) throw new Error(`${file} size is over 2MB.`)
		this.data.append("puri", f)
		this.id = id
		this.url = typeof file == "string" ? file : undefined
	}
	async delete(){
		if (!this.id) throw new Error("File ID is undefined.")
		api.post(api.links.Attachment.Delete, {
			marumie: this.client.secret.id,
			seskey: this.client.secret.key,
			imgid: this.id
		})
	}
}

class GuildMessageAttachMent extends FileAttachment {
	constructor(client, file, id){
		super(client, file, id)
		if (!client || !file) return
		this.data.append("ftype", "photosubmir")
	}
}
class DMMessageAttachMent extends FileAttachment {
	constructor(client, file, targetid, id){
		super(client, file, id)
		if (!client || !file) return
		this.data.append("ftype", "photosubmih")
		this.data.append("targetid", `${targetid}`)
	}
}

exports.GuildMessageAttachMent = GuildMessageAttachMent
exports.DMMessageAttachMent = DMMessageAttachMent