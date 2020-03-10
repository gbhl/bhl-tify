const env = require('../package.json');

const info = {
	VERSION: env.version,
	AUTHOR: env.author,
	LICENSE: env.license,
	REPOSITORY_URL: env.repository.url,
	BUGS_URL: env.bugs.url,
	DOCS_URL: env.faq,
};

module.exports = {
	NODE_ENV: '"production"',
	INFO: `"${escape(JSON.stringify(info))}"`,
};
