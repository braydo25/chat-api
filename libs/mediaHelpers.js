const http = require('http');
const https = require('https');
const stream = require('stream');
const imageSize = require('image-size');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

ffmpeg.setFfprobePath(ffprobeStatic.path);

/*
 * Images
 */

function getImageDimensionsSync(imageBuffer) {
  return imageSize(imageBuffer);
}

function getImageDimensionsFromUrl(imageUrl) {
  let client = http;

  if (imageUrl.includes('https')) {
    client = https;
  }

  return new Promise(resolve => {
    client.get(imageUrl, response => {
      const chunks = [];

      response.on('data', chunk => {
        chunks.push(chunk);

        try {
          const dimensions = getImageDimensionsSync(Buffer.concat(chunks));

          if (dimensions) {
            resolve(dimensions);
            console.log('dim!!', dimensions);
            response.destroy();
          }
        } catch (error) { /* noop */ }
      });
    });
  });
}

/*
 * Videos
 */

async function getVideoDimensions(videoBuffer) {
  const readableStream = new stream.Readable();
  readableStream.push(videoBuffer);
  readableStream.push(null);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(readableStream, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      for (let i = 0; i < metadata.streams.length; i++) {
        const stream = metadata.streams[i];
        const { width, height } = stream;

        if (width && height) {
          return resolve({ width, height });
        }
      }

      resolve({ width: null, height: null });
    });
  });
}

/*
 * Export
 */

module.exports = {
  getImageDimensionsFromUrl,
  getImageDimensionsSync,
  getVideoDimensions,
};
