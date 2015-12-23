function [Lam,M,time] = BBLin_Pre(A,para)


%Pre_Computation Stage for BBLin
%A: n x m and n >> m
%enough memory for an m x m matrix
%fast enough to compute inv( m x m)
%for BBLin_Pre BBLin_OQ/BBLin_OQ1: we have to use graph laplacian as
%normalization method(otherwise, the P matrix is no longer sysmmetric).
%Note that we can still get the similar alg if we use other kinds of
%normalization; --but we have to change the code!

if nargin<2
    para = [0.95,1];
end

tic;
c = para(1);%1-c is the restart probability
nflg = para(2);%the way to normalize the matrix
[n,m] = size(A)

%Get M matrix, which corresponds to the normalized of A
%already remove the 'zero row' (all elements in that row are zeros) and
%'zero column' (all elements in that column are zeros)
W = [sparse(n,n) A;A' sparse(m,m)];
P = BLin_W2P(W,nflg);
M = P(1:n,n+1:end);

T = eye(m) - c^2 * M' * M;

Lam = inv(T);
time = toc;









