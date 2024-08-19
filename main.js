const { graphqlHTTP } = require('express-graphql'); 
const { buildSchema } = require('graphql'); 
const express = require('express');

const app = express(); 
const port = 3000; 

//subset: the final product 
//target: a sequence which matches the requirements 

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
        find_subset(chromosome: String!, start: Int!, end: Int!) : Subset!
    }
`); 

//command used to run samtools view -h with the specified BAM file 
const { spawn } = require('child_process')

const rootValue = { 
    find_subset: ({ chromosome, start, end }) => { 
        const samFilePath = '/sample.sam'; 
        const command = `samtools view -h ${samFilePath} ${chromosome}:${start}-${end}`;

        return new Promise((resolve, reject) => { 
            const samtools = spawn('samtools', ['view', '-h', samFilePath, '${chromosome}:${start}-${end}']);
            let output = ''; 

            //appends the data to the output
            samtools.stdout.on('data', (data) => { output += data.toString(); }); 

            // error handling
            samtools.stderr.on('data', (data) => { console.error('Error: ${data}'); });

            samtools.on('close', (code) => {
                if (code !== 0) { 
                    stdout('the provided parameters do not lead to a solution');
                    return reject(new Error('samtools exited with code ${code}'));
                }

                const lines = output.split('/n');
                const targets = lines.map(line => {
                    //ignore the header lines
                    if (line.startsWith('@')) { 
                        return null; 
                    }

                    const fields = line.split('/t');
                    return { 
                        queryName: fields[0],
                        flag: parseInt(fields[1], 10), 
                        start: parseInt(fields[3], 10), 
                        end: parseInt(fields[3], 10) + fields[9].length - 1,
                    };
                }).filter(Boolean);
                
                resolve({ reads: targets });
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