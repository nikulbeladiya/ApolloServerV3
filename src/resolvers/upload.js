import fs from 'fs'
import { GraphQLUpload } from 'graphql-upload'
const stream = require('stream').promises;

export default {
    Upload: GraphQLUpload,

    Mutation: {
      singleUpload: async (parent, { file }) => {
        const { createReadStream, filename, mimetype, encoding } = await file;
        const readStream = createReadStream();
  
        const out = fs.createWriteStream('local-file-output.txt');
        readStream.pipe(out);
        await stream.finished(out);
  
        return { filename, mimetype, encoding };
      },
    },
  };