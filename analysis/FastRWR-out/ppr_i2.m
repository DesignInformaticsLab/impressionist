function [r, realIter] = ppr_i2(A, c, prefer_vec, maxIter, tolerance)
%
%***************************************************************************
%                              ppr_i2: the same with ppr_i1.m except 1-c here
%                              is restarting prob.
%   This source code is (c) Copyright 2004 by Jia-Yu (Tim) Pan 
%   (Computer Science Department, Carnegie Mellon University).
%   It may not be redistributed without the express consent of the
%   author.
%
%   Descriptions on the method MMG can be found in the following
%   papers:
%
%   Jia-Yu Pan, Hyung-Jeong Yang, Christos Faloutsos, and Pinar Duygulu.
%   Automatic Multimedia Cross-modal Correlation Discovery. 
%   In Proceedings of the 10th ACM SIGKDD Conference, 2004.
%   Seattle, WA, August 22-25, 2004
%
%   Jia-Yu Pan, Hyung-Jeong Yang, Christos Faloutsos, and Pinar Duygulu. 
%   GCap: Graph-based Automatic Image Captioning. 
%   In Proceedings of the 4th International Workshop on Multimedia
%   Data and Document Engineering (MDDE 04), in conjunction with
%   Computer Vision Pattern Recognition Conference (CVPR 04), 2004.
%   Washington DC, July 2nd 2004
%
%***************************************************************************
%
% A: sparse matrix
% c: degree of perference
% prefer_vec: sparse vector (column matrix)

if nargin<5
    tolerance = 10^(-9);
end
if nargin<4
    maxIter = 80;
end

[nR, nC] = size(A);

if(nR~=nC) disp('Inconsistent adjacent matrix'), return, end

r = prefer_vec;


realIter = maxIter;
for i=1:maxIter
  old_r = r;
  r = c*A*r + (1-c)*prefer_vec;
  %fprintf('.');
  
  
  diff = sum(abs(old_r - r)); % diff is in sparse format
  diff = full(diff);
  if(diff < tolerance), realIter = i; break, end
end
%fprintf('\n');

%fprintf('nIter: %d, diff: %g\n', realIter, diff);

return;