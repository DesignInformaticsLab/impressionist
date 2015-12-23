

1. BLin_Pre/BLin_OQ: 
      B_Lin algorithm -- works for a unipartite (n x n) graph
      BLin_Pre.m -- Pre_Computational Stage for B_Lin algorithm
      BLin_OQ.m -- On-Query Stage for B_Lin algorithm
      the largest matrix that has be tested is the one w/ 350k nodes and w 2m edges (the whole author-author matrix by DBLP datasets
      make sure that kmetis is in the current path
      tested on the window platform (it seems that the METIS package does not work on linux)


2. BBLin_Pre/BBLin_OQ: 
      BB_Lin algorithm -- works for a bipartite (n x m) graph (and n >> m)
      BBLin_Pre.m -- Pre_Computational Stage for BB_Lin algorithm
      BBLin_OQ.m -- On-Query Stage for BB_Lin algorithm
      

3. Other functions that called by BLin_Pre/BLin_OQ (you do not need to interact w/ them directly)
      BLin_W2P.m -- Setup Transition Matrix for random walk  (normalize the original adjacent matrix
      METISCls.m -- get clustering result by METIS package
      W2MetisIn.m -- convert adjacent matrix to the METIS Input