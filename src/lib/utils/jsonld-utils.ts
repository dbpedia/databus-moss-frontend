/* eslint-disable @typescript-eslint/no-explicit-any */
import { RdfUris } from "./rdf-uris";

/**
 * Deals with JSONLD in expanded form
 */
export class JsonldUtils {

    /**
     * Get graph by @id value
     * @param graphs A list of graphs
     * @param id The id of the graph to find
     * @returns A graph with id @id or null
     */
    static getGraphById(graphs: any, id: string) {
        for (const g in graphs) {
            const graph = graphs[g];
            if (graph[RdfUris.JSONLD_ID] != undefined && graph[RdfUris.JSONLD_ID] == id) {
                return graph;
            }
        }

        return null;
    }

    /**
     * Returns all graphs with a specified type from a list of graphs
     * @param graphs A list of graphs
     * @param graphType The graph type
     * @returns A list of graphs with type @graphType. If no graphs are found, the list is empty
     */
    static getTypedGraphs(graphs: any, graphType: string) {
        const result = [];

        for (const g in graphs) {
            const graph = graphs[g];

            if (graph[RdfUris.JSONLD_TYPE] != undefined &&
                graph[RdfUris.JSONLD_TYPE].includes(graphType)) {
                result.push(graph);
            }
        }

        return result;
    }
    
    /**
     * Finds a graph of an RDF type from a list of graphs
     * @param graphs The list of graphs
     * @param graphType The graph type of the graph to return
     * @returns A graph of type graphType or null
     */
    static getTypedGraph(graphs: any, graphType: string) {
        for (const g in graphs) {
            const graph = graphs[g];
            if (graph[RdfUris.JSONLD_TYPE] != undefined && graph[RdfUris.JSONLD_TYPE].includes(graphType)) {
                return graph;
            }
        }

        return null;
    }

    /**
     * Sets a literal in a graph
     * @param graph The target graph
     * @param predicateURI The property for the literal value
     * @param type The type of the literal (e.g. string, decimal)
     * @param value The value of the literal
     */
    static setLiteral(graph: any, predicateURI: string, type: string, value: string) {
        graph[predicateURI] = [];
        const entry: any = {};
        entry[RdfUris.JSONLD_TYPE] = type;
        entry[RdfUris.JSONLD_VALUE] = value;

        graph[predicateURI].push(entry);
    }

    /**
     * Sets an object value in a graph
     * @param graph The target graph
     * @param predicateURI The predicate URI for the object
     * @param objectURI The object URI
     */
    static setObject(graph: any, predicateURI: string, objectURI: string) {
        graph[predicateURI] = [];

        const entry: any = {};
        entry[RdfUris.JSONLD_ID] = objectURI;
        graph[predicateURI].push(entry);
    }

    /**
     * 
     * @param graph The target graph
     * @param predicateURI The predicate URI
     * @returns The object value of the predicate or null
     */
    static getValue(graph: any, predicateURI: string) {
        
        // Null if not found
        if (graph[predicateURI] == undefined) {
            return null;
        }

        if (graph[predicateURI].length == 1) {
            // Only one value exists
            const value = graph[predicateURI][0];

            // Search for values either indicated as @value or @id
            if (value[RdfUris.JSONLD_VALUE] != null) {
                return value[RdfUris.JSONLD_VALUE];
            }

            if (value[RdfUris.JSONLD_ID] != null) {
                return value[RdfUris.JSONLD_ID];
            }

            return null;
        } else {
            // Multiple values
            const result = [];

            // Again, search for values indicated as @value or @id
            for (const value of graph[predicateURI]) {
                if (value[RdfUris.JSONLD_VALUE] != null) {
                    result.push(value[RdfUris.JSONLD_VALUE]);
                }

                if (value[RdfUris.JSONLD_ID] != null) {
                    result.push(value[RdfUris.JSONLD_ID]);
                }
            }

            // Only return !null if values have been found
            if (result.length > 0) {
                return result;
            }
        }

        return null;
    }

    
}