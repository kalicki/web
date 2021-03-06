module.exports = {
	API_URI: process.env.API_URI,
	ROOT_DOMAIN: process.env.TLD,
	ROOT_DOMAIN_LIST: ['lavaboom.com', 'lavaboom.io', 'lavaboom.co'],
	IMAGES_PROXY_URI: 'https://rr.lavaboom.com',
	DEFAULT_LANG: 'en',
	DEFAULT_KEY_LENGTH: 4096,
	ESTIMATED_KEY_GENERATION_TIME_SECONDS: 24,
	INBOX_REDIRECT_DELAY: 1000,
	LAVABOOM_SYNC_REDIRECT_DELAY: 1000,
	BACKUP_KEYS_REDIRECT_DELAY: 1000,
	ENVELOPE_DEFAULT_MAJOR_VERSION: 1,
	ENVELOPE_DEFAULT_MINOR_VERSION: 0,
	AUTO_SAVE_TIMEOUT: 1000,
	LOADER_SHOW_DELAY: 150,
	FAST_ACTIONS_TIMEOUT: 250,
	MUMBLE_SHOW_DELAY: 1000,
	CRYPTO_CACHE_MAX_ENTRY_SIZE: 1024 * 512,
	CRYPTO_CACHE_TTL: 60 * 60 * 1000,

	// we set this to one year as there is no reason to expire those entries from-memory only cache
	// inbox.js algos relies on constant in-memory presence of once loaded threads
	// we can manually invalidate the whole cache of threads when we need to do so(sorting of threads for example, whole because we store in chunks of 15)
	INBOX_THREADS_CACHE_TTL: 60 * 60 * 24 * 365 * 1000,
	INBOX_LABELS_CACHE_TTL: 60 * 60 * 24 * 365 * 1000,

	INBOX_EMAILS_CACHE_TTL: 60 * 10 * 1000,
	SET_READ_AFTER_TIMEOUT: 3000,
	KEYS_BACKUP_README: 'https://lavaboom.com/faq/keyring-backup',
	POPUP_AUTO_HIDE_DELAY: 500,
	ORDERED_LABELS: ['Inbox', 'Drafts', 'Sent', 'Starred', 'Spam', 'Trash'],
	PLAN_LIST: ['BASIC'/*, 'TEST'*/],
	CRYPTO_DEFAULT_THREAD_POOL_SIZE: 4,
	KEY_EXPIRY_DAYS: 365,
	KEY_EXPIRY_DAYS_WARNING: 10,

	// what, why? because reasons ^^
	stripBOM: (str) => str.replace(/^\ufeff/g, '')
};