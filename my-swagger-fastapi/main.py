from enum import Enum
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

app = FastAPI(
    title="My API",
    version="1.0.0",
    description="API Documentation",
    servers=[
        {"url": "http://localhost:8000"}  # Tell Swagger UI the correct base URL
    ]
)

# Define an Enum for response types
class ResponseType(str, Enum):
    json = "json"
    text = "text"
    graph = "graph"


# Allow requests from React frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nodes = [
    {"id": "1", "label": "Node 1"},
    {"id": "2", "label": "Node 2"},
    {"id": "3", "label": "Node 3"}
]
edges = [
    {"id": "e1-2", "source": "1", "target": "2", "label": "Edge from Node 1 to 2"},
    {"id": "e2-3", "source": "2", "target": "3", "label": "Edge from Node 2 to 3"}
]


@app.get("/items", responses={
    200: {
        "content": {
            "application/json": {},
            "text/plain": {},
            "application/vnd.graph+json": {}  # Custom media type for graph
        },
        "description": "Returns a list of items in different formats",
    }
})
async def get_items(response_type: ResponseType = Query(ResponseType.json)):
    items = [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]
    
    if response_type == ResponseType.text:
        return PlainTextResponse(str(items))
    
    if response_type == ResponseType.graph:
        return JSONResponse(content={"nodes": nodes, "edges": edges}, media_type="application/vnd.graph+json")
    
    return JSONResponse(content=items)
