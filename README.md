# genepath_graphQL_server

This program is intended to take raw SAM files, a text-based file format used in bioinformatics to store alignment information for biological sequences that are mapped against reference sequences and serve subsets of the file through GraphQL. The user can specify a certain section they would like to serve, such as a start and an end, and the chromosome number. This program
will return all those which meet this criteria. 
