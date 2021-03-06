module.exports = /*@ngInject*/(co, utils) => {

	function CryptoKeysStorage (isPrivateComputer = false, isLoadDecrypted = true, prefix = 'lava-openpgp-') {
		const self = this;

		const publicName = prefix + this.publicKeysItem;
		const privateName = prefix + this.privateKeysItem;
		const privateSecureName = prefix + 'secure-' + this.privateKeysItem;

		const loadKeys = (storage, name) => {
			const keys = [];
			const armoredKeys = utils.def(() => JSON.parse(storage[name]), null);

			if (armoredKeys && armoredKeys.length > 0) {
				for (let keyArmored of armoredKeys) {
					const key = openpgp.key.readArmored(keyArmored);
					if (!key.err)
						keys.push(key.keys[0]);
				}
			}
			return keys;
		};

		const replaceKeys = (dstKeys, srcKeys) => {
			for (let srcKey of srcKeys) {
				const i = dstKeys.findIndex(k => k.primaryKey.fingerprint == srcKey.primaryKey.fingerprint);
				if (i < 0)
					dstKeys.push(srcKey);
				else
					dstKeys[i] = srcKey;
			}
		};

		const storeKeys = (storage, name, keys) => {
			const armoredKeys = keys.map(k => k.armor());
			storage[name] = JSON.stringify(armoredKeys);
		};

		this.clearAllKeys = () => {
			delete localStorage[privateName];
			delete localStorage[publicName];
			self.clearDecryptedPrivateKeys();
		};

		this.clearDecryptedPrivateKeys = () => {
			delete localStorage[privateSecureName];
			delete sessionStorage[privateSecureName];
		};

		this.loadPublic = () => {
			return loadKeys(localStorage, publicName);
		};

		this.loadPrivate = () => {
			const keys = loadKeys(localStorage, privateName);

			if (isLoadDecrypted) {
				replaceKeys(keys, loadKeys(localStorage, privateSecureName));
				replaceKeys(keys, loadKeys(sessionStorage, privateSecureName));
			}

			return keys;
		};

		this.storePublic = (keys) => {
			storeKeys(localStorage, publicName, keys);
		};

		const storePrivateKeys = (storage, name, keys) => {
			const existingKeys = loadKeys(storage, name);
			replaceKeys(existingKeys, keys);
			storeKeys(storage, name, existingKeys);
		};

		this.storePrivate = (keys) => {
			storePrivateKeys(localStorage, privateName, keys.filter(k => !k.primaryKey.isDecrypted));

			const storage = isPrivateComputer ? localStorage : sessionStorage;
			storePrivateKeys(storage, privateSecureName, keys.filter(k => k.primaryKey.isDecrypted));
		};
	}

	CryptoKeysStorage.prototype.publicKeysItem = 'public-keys';
	CryptoKeysStorage.prototype.privateKeysItem = 'private-keys';

	return CryptoKeysStorage;
};