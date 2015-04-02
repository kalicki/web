const mimelib = require('mimelib');

module.exports = /*@ngInject*/(contacts, utils) => {
	const hash = (data) => openpgp.util.hexstrdump(openpgp.crypto.hash.sha256(data));

	function ManifestPart (manifestPart) {
		const self = this;

		this.id = manifestPart.id;
		this.size = manifestPart.size;
		this.filename = manifestPart.filename;
		this.hash = manifestPart.hash;

		this.isValid = (body) => body.length == self.size && hash(body) == self.hash;

		// todo: hack, there should be just one content type, blocked: https://github.com/lavab/mailer/issues/33
		const contentType = manifestPart.content_type || manifestPart['content-type'];
		if (contentType) {
			this.contentType = (contentType.defaultValue ? contentType.defaultValue : contentType).toLowerCase();
			this.charset = (contentType.charset ? contentType.charset : 'utf-8').toLowerCase();
		} else {
			this.contentType = 'text/plain';
			this.charset = 'utf-8';
		}

		this.isHtml = () => self.contentType.includes('/html');
	}

	function Manifest (manifest) {
		const self = this;

		const parseAddresses = (src) => {
			if (src)
				return angular.isArray(src)
					? src.map(e => Manifest.formatFrom(e))
					: [Manifest.formatFrom(src)];
			return [];
		};

		this.from = parseAddresses(manifest.headers.from);
		this.to = parseAddresses(manifest.headers.to);
		this.cc = parseAddresses(manifest.headers.cc);
		this.bcc = parseAddresses(manifest.headers.bcc);

		this.subject = manifest.headers.subject;

		this.getDestinationEmails = () => {
			const emails = utils.uniq([
				...self.to,
				...self.cc,
				...self.bcc
			]);

			return [...emails];
		};

		this.getFileById = (id) => manifest.parts.find(p => p.id == id);
		
		this.setBody = (data, contentType) => {
			manifest.parts.push({
				id: 'body',
				hash: hash(data),
				content_type: contentType
			});
		};

		this.getPart = (id = 'body') => new ManifestPart(manifest.parts.find(p => p.id == id));

		this.files = manifest.parts.filter(p => p.id != 'body').map(p => new ManifestPart(p));

		this.addAttachment = (id, data, fileName, contentType) => {
			manifest.parts.push({
				id: id,
				hash: hash(data),
				filename: fileName,
				content_type: contentType ? contentType : 'application/octet-stream',
				charset: 'utf-8',
				size: data.length
			});
		};

		this.isValid = () => !!manifest.parts.find(p => p.id == 'body');

		this.stringify = () => JSON.stringify(manifest);
	}

	Manifest.formatFrom = (fromAddress) => {
		if (!fromAddress.address)
			fromAddress = mimelib.parseAddresses(fromAddress)[0];

		const address = fromAddress.address ? fromAddress.address : fromAddress;
		const fromContact = contacts.getContactByEmail(address);
		const name = fromAddress.name ? fromAddress.name : (fromContact ? fromContact.getFullName() : '');
		return {
			address,
			name,
			prettyName: address + (name ? ` (${name})` : '')
		};
	};

	Manifest.defaultVersion = '1.0.0';

	Manifest.create = ({fromEmail, to, cc, bcc, subject}) => {
		const manifest = {
			version: Manifest.defaultVersion,
			headers: {
				from: fromEmail,
				to,
				subject: subject
			},
			parts: []
		};

		if (cc && cc.length > 0)
			manifest.headers.cc = cc;

		if (bcc && bcc.length > 0)
			manifest.headers.bcc = bcc;

		return new Manifest(manifest);
	};

	Manifest.createFromJson = (manifest) => {
		let rawManifest;
		try {
			rawManifest = JSON.parse(manifest);
		} catch (error) {
			throw new Error('invalid manifest format!');
		}
		return new Manifest(rawManifest);
	};

	return Manifest;
};