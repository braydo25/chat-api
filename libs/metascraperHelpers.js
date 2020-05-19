const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-audio')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-media-provider')(),
  require('metascraper-publisher')(),
  require('metascraper-soundcloud')(),
  require('metascraper-title')(),
  require('metascraper-spotify')(),
  require('metascraper-video')(),
  require('metascraper-youtube')(),
]);

async function extractMetadata(targetUrl) {
  targetUrl = (!targetUrl.includes('http')) ? `http://${targetUrl}` : targetUrl;

  const { headers, body, url } = await got(targetUrl);
  const metadata = await metascraper({ html: body, url });

  if (headers['content-type'].includes('audio')) {
    metadata.audio = targetUrl;
  }

  if (headers['content-type'].includes('image')) {
    metadata.image = targetUrl;
  }

  if (headers['content-type'].includes('video')) {
    metadata.video = targetUrl;
  }

  return Object.assign({ responseHeaders: headers }, metadata || {});
}

/*
 * Export
 */

module.exports = { extractMetadata };
