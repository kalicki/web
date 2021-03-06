module.exports = /*@ngInject*/($scope, $stateParams, $translate, co, consts, crypto, saver, notifications, router, Key) => {
	$scope.selectedContactId = $stateParams.contactId;
	$scope.isNotFound = false;
	$scope.emails = [];

	const translations = {
		LB_EMAIL_NOT_FOUND: '',
		LB_CANNOT_IMPORT_PUBLIC_KEY: '',
		LB_PUBLIC_KEY_IMPORTED: '%'
	};
	$translate.bindAsObject(translations, 'MAIN.CONTACTS');

	$scope.starEmail = () => {
		if ($scope.isEditMode)
			$scope.currentEmail.isStar = !$scope.currentEmail.isStar;
	};

	$scope.requestPublicKey = () => {
		router.showPopup('compose', {to: $scope.currentEmail.email});
	};

	$scope.uploadPublicKey = (data) => {
		try {
			const key = crypto.readKey(data);

			if (!key)
				throw new Error('not_found');
			const primaryKey = key.primaryKey;
			if (!primaryKey)
				throw new Error('not_found');

			$scope.currentEmail.key = new Key(key);

			notifications.set('public-key-import-ok' + $scope.currentEmail.email, {
				type: 'info',
				text: translations.LB_PUBLIC_KEY_IMPORTED({
					email: $scope.currentEmail.email,
					algos: $scope.currentEmail.key.algos,
					length: $scope.currentEmail.key.length
				}),
				namespace: 'contact.profile',
				timeout: 3000
			});
		} catch (err) {
			notifications.set('public-key-import-fail' +  $scope.currentEmail.email, {
				text: translations.LB_CANNOT_IMPORT_PUBLIC_KEY,
				namespace: 'contact.profile'
			});
		}
	};

	$scope.downloadPublicKey = () => {
		console.log($scope.currentEmail.key);
		saver.saveAs($scope.currentEmail.key.armor(), `${$scope.currentEmail.email}-publicKey.txt`);
	};

	$scope.remove = () => {
		console.log('remove from', $scope.details[$scope.emails], $scope.currentEmail.$$hashKey);
		$scope.details[$scope.emails] = $scope.details[$scope.emails].filter(e => e.$$hashKey != $scope.currentEmail.$$hashKey);
	};

	$scope.$watch('currentEmail.name', (o, n) => {
		if (o == n)
			return;

		let email = $scope.currentEmail;
		if (!email || !email.name)
			return;

		email.email = email.name.includes('@') ? email.name : `${email.name}@${consts.ROOT_DOMAIN}`;
		email.loadKey(true);
	});
};
