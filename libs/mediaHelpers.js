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

      const { width, height } = metadata.streams[0];

      resolve({ width, height });
    });
  });
}

/*
 * Export
 */

module.exports = {
  getImageDimensionsSync,
  getVideoDimensions,
};
