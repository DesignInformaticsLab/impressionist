/**
 * Created by Fabian Gadau on 3/19/2015.
 * Taken from http://jabtunes.com/labs/3d/bunny/
 * Not Implemented Yet
 */
THREE.SubdivisionModifier = function(subdivisions) {
    this.subdivisions = (subdivisions === undefined) ? 1 : subdivisions;
};
THREE.SubdivisionModifier.prototype.modify = function(geometry) {
    var repeats = this.subdivisions;
    while (repeats-- > 0) {
        this.smooth(geometry);
    }
    delete geometry.__tmpVertices;
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
};
(function() {
    var WARNINGS = !true;
    var ABC = ['a', 'b', 'c'];

    function getEdge(a, b, map) {
        var vertexIndexA = Math.min(a, b);
        var vertexIndexB = Math.max(a, b);
        var key = vertexIndexA + "_" + vertexIndexB;
        return map[key];
    }

    function processEdge(a, b, vertices, map, face, metaVertices) {
        var vertexIndexA = Math.min(a, b);
        var vertexIndexB = Math.max(a, b);
        var key = vertexIndexA + "_" + vertexIndexB;
        var edge;
        if (key in map) {
            edge = map[key];
        } else {
            var vertexA = vertices[vertexIndexA];
            var vertexB = vertices[vertexIndexB];
            edge = {
                a: vertexA,
                b: vertexB,
                newEdge: null,
                faces: []
            };
            map[key] = edge;
        }
        edge.faces.push(face);
        metaVertices[a].edges.push(edge);
        metaVertices[b].edges.push(edge);
    }

    function generateLookups(vertices, faces, metaVertices, edges) {
        var i, il, face, edge;
        for (i = 0, il = vertices.length; i < il; i++) {
            metaVertices[i] = {
                edges: []
            };
        }
        for (i = 0, il = faces.length; i < il; i++) {
            face = faces[i];
            processEdge(face.a, face.b, vertices, edges, face, metaVertices);
            processEdge(face.b, face.c, vertices, edges, face, metaVertices);
            processEdge(face.c, face.a, vertices, edges, face, metaVertices);
        }
    }

    function newFace(newFaces, a, b, c) {
        newFaces.push(new THREE.Face3(a, b, c));
    }
    THREE.SubdivisionModifier.prototype.smooth = function(geometry) {
        var tmp = new THREE.Vector3();
        var oldVertices, oldFaces;
        var newVertices, newFaces;
        var n, l, i, il, j, k;
        var metaVertices, sourceEdges;
        var sourceEdges, newEdgeVertices, newSourceVertices
        oldVertices = geometry.vertices;
        oldFaces = geometry.faces;
        metaVertices = new Array(oldVertices.length);
        sourceEdges = {};
        generateLookups(oldVertices, oldFaces, metaVertices, sourceEdges);
        newEdgeVertices = [];
        var other, currentEdge, newEdge, face;
        var edgeVertexWeight, adjacentVertexWeight, connectedFaces;
        for (i in sourceEdges) {
            currentEdge = sourceEdges[i];
            newEdge = new THREE.Vector3();
            edgeVertexWeight = 3 / 8;
            adjacentVertexWeight = 1 / 8;
            connectedFaces = currentEdge.faces.length;
            if (connectedFaces != 2) {
                edgeVertexWeight = 0.5;
                adjacentVertexWeight = 0;
                if (connectedFaces != 1) {
                    if (WARNINGS) console.warn('Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge);
                }
            }
            newEdge.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight);
            tmp.set(0, 0, 0);
            for (j = 0; j < connectedFaces; j++) {
                face = currentEdge.faces[j];
                for (k = 0; k < 3; k++) {
                    other = oldVertices[face[ABC[k]]];
                    if (other !== currentEdge.a && other !== currentEdge.b) break;
                }
                tmp.add(other);
            }
            tmp.multiplyScalar(adjacentVertexWeight);
            newEdge.add(tmp);
            currentEdge.newEdge = newEdgeVertices.length;
            newEdgeVertices.push(newEdge);
        }
        var beta, sourceVertexWeight, connectingVertexWeight;
        var connectingEdge, connectingEdges, oldVertex, newSourceVertex;
        newSourceVertices = [];
        for (i = 0, il = oldVertices.length; i < il; i++) {
            oldVertex = oldVertices[i];
            connectingEdges = metaVertices[i].edges;
            n = connectingEdges.length;
            beta;
            if (n == 3) {
                beta = 3 / 16;
            } else if (n > 3) {
                beta = 3 / (8 * n);
            }
            sourceVertexWeight = 1 - n * beta;
            connectingVertexWeight = beta;
            if (n <= 2) {
                if (n == 2) {
                    if (WARNINGS) console.warn('2 connecting edges', connectingEdges);
                    sourceVertexWeight = 3 / 4;
                    connectingVertexWeight = 1 / 8;
                } else if (n == 1) {
                    if (WARNINGS) console.warn('only 1 connecting edge');
                } else if (n == 0) {
                    if (WARNINGS) console.warn('0 connecting edges');
                }
            }
            newSourceVertex = oldVertex.clone().multiplyScalar(sourceVertexWeight);
            tmp.set(0, 0, 0);
            for (j = 0; j < n; j++) {
                connectingEdge = connectingEdges[j];
                other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
                tmp.add(other);
            }
            tmp.multiplyScalar(connectingVertexWeight);
            newSourceVertex.add(tmp);
            newSourceVertices.push(newSourceVertex);
        }
        newVertices = newSourceVertices.concat(newEdgeVertices);
        var sl = newSourceVertices.length,
            edge1, edge2, edge3;
        newFaces = [];
        for (i = 0, il = oldFaces.length; i < il; i++) {
            face = oldFaces[i];
            edge1 = getEdge(face.a, face.b, sourceEdges).newEdge + sl;
            edge2 = getEdge(face.b, face.c, sourceEdges).newEdge + sl;
            edge3 = getEdge(face.c, face.a, sourceEdges).newEdge + sl;
            newFace(newFaces, edge1, edge2, edge3);
            newFace(newFaces, face.a, edge1, edge3);
            newFace(newFaces, face.b, edge2, edge1);
            newFace(newFaces, face.c, edge3, edge2);
        }
        geometry.vertices = newVertices;
        geometry.faces = newFaces;
    };
})();