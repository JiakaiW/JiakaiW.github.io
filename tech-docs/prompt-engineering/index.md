---
layout: tech-docs
title: Prompt Engineering for Physicists
description: A practical guide to prompt engineering techniques specifically tailored for physics research and computation.
permalink: /tech-docs/prompt-engineering/
---

<style>
main {
    position: relative;
    z-index: 1;
    padding: 2em;
    max-width: none !important;
    width: 100%;
    margin: 0;
    min-height: calc(100vh - 200px);
    background: transparent !important;
}

.dropdown-content a,
.dark-mode .dropdown-content a {
    color: white !important;
}

main > * {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    /* Remove white text color - let it use default theme colors */
    /* color: white; */
    /* Add left alignment */
    text-align: left;
}

main h1 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 1em;
    text-align: left;
}

main p {
    margin-bottom: 1em;
    line-height: 1.6;
    text-align: left;
}

main a {
    color: var(--color-primary);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}

/* Add hover area for dropdown */
.menu-link {
    padding-bottom: 20px;
}

pre, code {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-x: auto;
}
</style>

# Prompt example for generating [1600+ line design document](https://github.com/JiakaiW/quant_ph_citation_graph_for_LLM/blob/main/src/frontend/refactoring_action_plan.md):  

Use Premium models like Claude 4 sonnet thinking for planing tasks:

```prompt
Let's do these things: 1) Review the frontend codebase /src/frontend and understand how each part works together to create this sigma.js based customized visualization of the clustering in the database. 2) Create a new markdown file called current_stage_summary.md, and use that to doument in great detail how each file (including similar files that are different implementing versions) works. Make sure the important classes and files (backbone) are documented, also include the util files and api files. For each significant class or file, create bullet points on how they work, and what do they interface with. Double check you have documented all non-trivial files/classes/functions in /src/frontend, then, read the existing markdown files, in the end of current_stage_summary.md, summarize the structure of the /src/frontend/ directory. current_stage_summary.md will serve as an important documentation for archtectural design later. 3) I would like to use tree-based approach, but combined with some of the later-added more object-oriented classes to refactor the code. Currently those later added code more like skeletons. Please create action points to plan in great detail how to use the more object-oriented classes to improve the organizatoin of the tree-based approach. Specifically, mention what function should be merged/moved from which source file to which desination file, and what file should remain in the end, and what should be deleted. (The Tree-based implementation contains many features I would like to keep, it's the code organization that I would like to improve) In this final step, please think like an architect. 
```

Then refine the design document:
```prompt
I'm afraid the refactoring of the tree-first approach requires more planning. The deprecated LOD Legacy GraphManager uses R-Tree and caching to keep track of what nodes have been loaded. The API between front and backend is simply a list of nodes and a list of edges which result from simply SQLite database query. The Tree-first approach requires more complicated backend and frontend API design. Overall, I feel like in the refactoring_action_plan you just put "Tree First" and those OOP concepts and classes together without thinking in-depth about what is the expected input and output protocol and the inherent algorithm/logic used by those classes, without detailed design the implementation will be disastrous. Here are some questions that may help you make the plan more detailed and down-to-earth. Don't consider these questions one-by-one, the final plan should be influenced by all these questions to make the design unified, TreeStateManager. 1.1 UnifiedGraphManager: The legacy non-Tree GraphManager uses R-Tree to do fast spatial query/addition/removal of nodes, how can we use spatial information with tree? Does enrichment mean "add more child leafs?" How does level of detail (LOD) affect Tree-compatible UnifiedGraphManager? We need detailed design. Should LOD be tied to the level tree? For example in globle view we load from the root 4 levels downwards? What if the tree is skrewed/unbalanced? Do we cound level bottom-up? Or do we use the year of publication of the node (each node is an arxiv paper) to determine whether it should be loaded? Or its degree (higher degree nodes are more important and should be loaded earlier)? Should we have a quadtree in the frontend to keep track of where the branch is broken, so if our zoom is high and detail is to be loaded we can use quadtree for spatial information to find the broken branch and expand that branch? Similarly we might use the quadtree to determine at a specific LOD when we need to remove nodes (fold branches) starting at which node we remove the branch from front end? 1.2, 1.3 NodeService/EdgeService: Again, tree-based algorithm can be dramatically different from the legacy implementation. Also, how are you going to make sure "guaranteed connectivity"? How will the backend return data? If the backend returns a list of nodes and then a list of edges as a pair of data in a batch, then we need to make sure the query manager does not interrupt such pairs of data. Should the 2.2 EnhancedLoadingStrategy contain this design? Also, should NodeService and EdgeService interface with 4.3 SearchManager? The SearchManager should ensure whatever returned by the search is available on the graph, how should it implement it? To ensure connectivity (no broken nodes) do we need to BFS or DFS or use some other algorithm to find the connection to that search result if it's not already loaded? After clicking on a search result the legacy design highlights that node and its edges and its neighbours, in tree based design, how do we find its edges & neighbors? Should this query be done in frontend or backend? Which class is responsible for this query? Please update the refactoring_action_plan.md on these design details. 
```
Further design document refine:
```prompt
1) getYearThresholdForZoom(), getDegreeThresholdForZoom(), calculateSpatialDensity() are not implemented. I think calculateSpatialDensity might be too complicated maybe we can just remove it and spatialDensity from the design. 
2) When you say enrich, or enrichment in the design document, you mean expand tree nodes that contain child nodes. However there is another type of tree edge loading we didn't include in this design document. The original citation graph is not a DAG, but contains circles. We did @create_tree_edge_tables.py to convert the graph to a DAG but also creates some removed edges that should be loaded when LOD is zoomed in. How should we manage those edges with LOD? 
3) Currently the config.yaml contains some unused parameters, let's identify what parameters we really need to use and specify it in the design document. 
```


Then I use the 1500+ line design document to prompt a cheaper model like Gemini-2.5-pro to do implementation:
```prompt
Now implement phase 1 in @refactoring_action_plan.md
```
```prompt
Now implement phase 2 in @refactoring_action_plan.md
```
```prompt
Now implement phase 3 in @refactoring_action_plan.md
```

Let Gemini-2.5-pro check its own implementation:
```prompt
Let's be a bit cautious. Please review the whole design document @refactoring_action_plan.md , and let's review whether the implementation of Phase 1, 2, 3 has faithfully carried out the design. If there are any mismatches, desribe the mismatch in greate detail by creating a new documentation refactoring_action_logging.md inside /src/frontend/
```