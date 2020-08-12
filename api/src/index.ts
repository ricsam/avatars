import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'apollo-server';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { sentenceCase } from 'change-case';

const layerFolder = path.join(__dirname, 'images');

const variantLocalFilePathStore: {[id: string]: string} = {};

type Variant = {
  id: string;
  title: string;
}

type Layer = {
  id: string;
  title: string;
  variants: Variant[]
}

const layers: Layer[] = [];

const indexes = [
'skin',
'eye size',
'eye color',
'eyebrows',
'hair',
'lips',
'nose',
'shirt',
];

fs.readdirSync(layerFolder).forEach(layerName => {
  if (layerName[0] !== '.') {
    const layerPath = path.join(layerFolder, layerName);
    const layerStat = fs.statSync(layerPath);
    if (layerStat.isDirectory()) {
      const layer: Layer = {
        id: uuid(),
        title: sentenceCase(layerName),
        variants: [],
      };

      if (indexes.indexOf(layerName) === -1) {
        throw new Error('add index for ' + layerName);
      }
      layers[indexes.indexOf(layerName)] = layer;
      fs.readdirSync(layerPath).forEach((variantName) => {
        const variantPath = path.join(layerPath, variantName);
        const variantStat = fs.statSync(variantPath);
        if (!variantStat.isDirectory() && variantName[0] !== '.') {
          const id = uuid();
          const variant: Variant = {
            id,
            title: sentenceCase(path.parse(variantName).name),
          }
          layer.variants.push(variant);
          variantLocalFilePathStore[id] = variantPath;
        }
      })
    }
  }
});

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`

  type Variant {
    id: String
    title: String
  }

  type Layer {
    id: String
    title: String
    variants: [Variant!]!
  }

  type Query {
    layers: [Layer!]!
  }
`;

const resolvers = {
  Query: {
    layers: () => layers,
  },
};


const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

app.get('/img/:id', (req, res) => {
  const { id } = req.params;
  const imgPath = variantLocalFilePathStore[id];
  if (!imgPath) {
    res.status(404).send('Not found').end();
    return;
  }
  fs.createReadStream(imgPath).pipe(
    res
  )
})

app.use(express.static(path.join(__dirname, '../../web/build')))

server.applyMiddleware({ app });

// bodyParser is needed just for POST.
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
