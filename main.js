const { graphqlHTTP } = require('express-graphql'); 
const { buildSchema } = require('graphql'); 
const express = require('express');

const app = express(); 
const port = 3000; 

const schema = buildSchema(`

    type Subset { 
        reads: [Target]
    }

    type Target { 
        queryName: String!
        flag: Int!
        start: Int!
        end: Int!
    }

    type Query { 
        find_subset(genome: String!, chromosome: String!, start: Int!, end: Int!) : Subset!
    }
`); 

const { spawn } = require('child_process')

const rootValue = { 
    find_subset: ({ genome, chromosome, start, end }) => { 
        const bamFilePath = '/sample.sam'; 
        const command = `samtools view -h ${bamFilePath} ${chromosome}:${start}-${end}`;

        return new Promise((resolve, reject) => { 
            
        })




        return result;
    }
}; 

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    graphiql: true,
}));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
});