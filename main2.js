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
        rname: String!
        start: Int!
        mapq: Int!
        cigar: String!
        rnext: String!
        end: Int!
        len: Int!
        seq: String!
        qual: String!
    }

    type Query { 
        find_subset(chromosome: String!, start: Int!, end: Int!) : Subset!
    }
`); 

const { spawn } = require('child_process')

function parseString(output) { 
    const lines = output.split('\n');
    console.log(lines);

    const subset = lines.filter(line => line.length > 0).map((line,line_number) => { 
        const param = line.split('\t');
        const target = {}; 

        target.queryName = param[0];
        target.flag = parseInt(param[1]); 
        target.rname = param[2]; 
        target.start = parseInt(param[3]); 
        target.mapq = parseInt(param[4]); 
        target.cigar = param[5]; 
        target.rnext = param[6]; 
        target.end = parseInt(param[7]); 
        target.len = parseInt(param[8]); 
        target.seq = param[9]; 
        target.qual = param[10]; 

        if (isNaN(target.flag))
            console.log(`line_number = ${line_number}:${line}`); 

        return target; 
    })
    return {reads: subset}; 
}

const rootValue = { 
    find_subset: ({ chromosome, start, end }) => { 

        return new Promise((resolve, reject) => { 
            const bamFilePath = 'sample.bam'; 
            const command = spawn('samtools', ['view', bamFilePath, `${chromosome}:${start}-${end}`]);
            let output = '';

            command.stdout.on('data', (data) => { 
                console.log(data);
                output = output + data; 
            }); 
            
            command.on('close', (code) => {
                const subset = parseString(output);
                //console.log('closed');
                //console.log(JSON.stringify(subset));
                resolve(subset); 
            });
        });
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