const cripto = require('../../../../js/apps/Utils/services/crypto');

describe('Crypto Service', () => {
	let service;

	beforeEach(inject(($q, $rootScope) => {
		service = new cripto($q, $rootScope, {}, {}, {}, {});
	}));

	it('should exist', () => {
		expect(service).not.toBeNull();
	});
});
