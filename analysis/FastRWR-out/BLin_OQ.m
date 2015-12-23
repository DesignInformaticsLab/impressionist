function [r, qt] = BLin_OQ(Q1,U,V,Lam,c,i,W,k0)


%B_Lin Alg: On-Query Stage
%Q1,U,V,Lam: pre-computed matraces by BLin_Pre
%c: 1-c restart prob
%i: query node

if nargin<8
    k0 = 2000;
end
if nargin<7
    W = -1;
end
    

tic;
[m,n] = size(Q1);
ei = sparse(m,1);
ei(i) = 1;

%i^th column of Q1; 
r1 = Q1(:,i);
%fix the influence of those outside community links
%r0 = Q1 * (U * (sparse(Lam * (V * r1))));
r0 = V * r1;
%toc
r0 = sparse(Lam * r0);
%toc
r0 = U * r0;
%toc
%r0(find(full(r0)<1e-4)) = 0;
r00 = full(r0); r00(find(r00<1e-4))=0; r0 = sparse(r00);
r0 = Q1 * r0;
%toc

r = (1-c) * (r1 + c * r0);

if size(W,1)~=1
    %%disp('start to re-ppr')
    %post-processing
    %k0=2000;
    %exact rwr within the first k0=2000;
    [Y0,I0] = sort(full(r),1,'descend');
    p0 = find(I0==i);
    n0 = max(p0,k0);
    pid = I0(1:n0);
    P0 = BLin_W2P(W(pid,pid),3);
    y = sparse(n0,1);
    y(p0) = 1;
    [r10, realIter] = ppr_i2(P0, c, y);
    [Y10,I10] = sort(full(r10),1,'descend');
    I0(1:n0) = pid(I10);
    %r(pid) = r10 * sum(r(pid));%adjust the ranking vectormr
    
    r = sparse(m,1);%setting the remaining to be 0
    r(pid) = r10;
    
    
end
%normalize
r = r - min(r);
if sum(r)>0
    r = r/sum(r);
end

qt = toc;