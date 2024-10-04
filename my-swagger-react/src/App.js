import React, { useState, useEffect, useCallback } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import ReactFlow, { useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";

// Custom plugin to render a graph for 'application/vnd.graph+json' responses
const graphPlugin = (system) => ({
  wrapComponents: {
    responseBody: (Original, system) => (props) => {
      const contentType = props.contentType;
      const { content: body } = props;

      // Check if the response type is graph (custom media type)
      if (contentType === "application/vnd.graph+json") {
        let graphData;

        // If it's a string, parse it; otherwise, use it directly
        try {
          graphData = typeof body === "string" ? JSON.parse(body) : body;
        } catch (error) {
          console.error("Error parsing graph data", error);
          return <p>Error rendering graph data</p>;
        }

        console.log("Graph Data:", graphData);

        // Set initial nodes and edges based on the response
        const initialNodes = graphData.nodes.map((node, index) => ({
          id: node.id,
          data: { label: node.label },
          position: { x: 100 + index * 150, y: 100 }, // Adjusted position for spacing
        }));

        const initialEdges = graphData.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        }));

        // Use ReactFlow hooks to manage nodes and edges state
        const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
        const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

        // Handle new edge connection
        const onConnect = useCallback(
          (params) => setEdges((eds) => addEdge(params, eds)),
          [setEdges]
        );

        return (
          <div style={{ height: "500px", width: "100%" }}>
            <h3>Graph View:</h3>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              style={{ width: "100%", height: "500px" }}
            />
          </div>
        );
      }

      // For all other content types, render the default response body
      return <Original {...props} />;
    },
  },
});

function App() {
  const [swaggerData, setSwaggerData] = useState(null);

  useEffect(() => {
    // Fetch the OpenAPI schema from FastAPI backend
    fetch("http://localhost:8000/openapi.json")
      .then((response) => response.json())
      .then((data) => setSwaggerData(data))
      .catch((error) => console.error("Error fetching OpenAPI schema:", error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>API Documentation with Custom Graph View</h1>
        {swaggerData ? (
          <SwaggerUI
            spec={swaggerData}
            plugins={[graphPlugin]} // Inject the custom graph plugin
          />
        ) : (
          <p>Loading API documentation...</p>
        )}
      </header>
    </div>
  );
}

export default App;
