module.exports = /*@ngInject*/($delegate, $injector, utils) => {
	const self = $delegate;

	const getDOM = (html) => {
		var dom = new DOMParser().parseFromString(html, 'text/html');
		return dom.querySelector('body');
	};

	const backupStyles = (dom, opts, level = 0) => {
		const processNode = (node) => {
			let style = node.getAttribute('style');
			if (!style)
				return;

			if (style)
				style = style.trim();
			if (!style)
				return;

			const key = 'i' + opts.styleIndex;
			opts.styles[key] = {
				style,
				title: node.getAttribute('title')
			};
			node.setAttribute('title', `${opts.uniqKey}:${opts.styleIndex}`);
			opts.styleIndex++;
		};

		for(let node of dom.childNodes) {
			if (node.getAttribute)
				processNode(node);

			if (node.childNodes)
				backupStyles(node, opts, level + 1);
		}
	};

	const restoreStyles = (dom, opts, level = 0) => {
		const processNode = (node) => {
			const text = node.getAttribute('title');
			const parts = text ? text.split(':') : null;
			const styleIndex = parts && parts[0] == opts.uniqKey ? parts[1] : null;

			if (styleIndex !== null) {
				const style = opts.styles['i' + styleIndex];
				node.setAttribute('style', style.style);
				if (style.title)
					node.setAttribute('title', style.title);
				else
					node.removeAttribute('title');
			}
		};

		for(let node of dom.childNodes) {
			if (node.getAttribute)
				processNode(node);

			if (node.childNodes)
				restoreStyles(node, opts, level + 1);
		}

		if (level === 0) {
			for(let node of opts.removeNodes)
				node.parentNode.removeChild(node);
		}
	};

	function sanitize(html, isAllowed, result) {
		let dom = getDOM(html);

		const stylesOpts = {
			uniqKey: utils.getRandomString(16),
			styleIndex: 0,
			styles: {},
			removeNodes: []
		};

		backupStyles(dom, stylesOpts);

		const sanitizedEmailBody = $delegate(dom.innerHTML);
		dom = getDOM(sanitizedEmailBody);

		if (isAllowed)
			restoreStyles(dom, stylesOpts);

		if (result)
			result.hasStyles = stylesOpts.styleIndex > 0;

		return dom.innerHTML;
	}

	function sanitizer (html) {
		const user = $injector.get('user');

		if (user.settings.styles == 'none')
			return $delegate(html);

		if (user.settings.styles == 'all')
			return sanitize(html, true);

		return $delegate(html);
	}

	return sanitizer;
};