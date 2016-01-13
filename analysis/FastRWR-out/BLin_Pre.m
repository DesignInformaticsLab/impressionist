function [Q1,U,V,Lam,t0] = BLin_Pre(W,para)



if nargin<2
    [m,n] = size(W);
    para = [0.95 1e-5 fix(m/100) 2 fix(m/10) 3];
end
%B_Lin Alg: Pre_Computational Stage
%A: Normalized Adjacent matrix
%cRe: Cluster/Partition Result
%para: parameter involved in pre-compuational stage
%   c: para(1) (1-c) restart prob
%   th: para(2) threshold to further sparse
%   t:  para(3) rank to do low-rank-approximation on Aod
%   lr: para(4) which method to do low-rank-approximation
%   k: para(5) how many pieces/partitions
%   nf: para(6) how to tranform W to P(A);


c = para(1);
th = para(2);
t = para(3);
lr = para(4);
k = para(5);
nf = para(6);

%remove self loop
W = (triu(W,1) + tril(W,-1));

A = BLin_W2P(W,nf);

%to deal w/ the special case when we only have one partition
%in this case, BLin is just PreCompute method
if k==1
    n = size(A,1);
    
    Q1 = inv(speye(n) - c * A);
    U = sparse(n,0);
    V = sparse(0,n);
    Lam = sparse(0,0);
    t0 = 0;
    return;
end

%getting partition results by metis
cRe = METISCls(W,k);

%getting partition by k-way ncut
%cRe = Ncutk(W,fix(log2(k))+1,1);
%[cRe] = my_spec_cut(W,fix(log2(k))+1,[1 3]);

if cRe==-1%error in partition
    Q1 = -1;U=-1;V=-1;Lam=-1;
    return;
end

%split A into two matrices
[Ad,Aod] = MatSpt(A,cRe);
%max(cRe)
%disp(num2str(nnz(Aod)/nnz(Ad)))
%for within-partition matrix Ad, Get the inversion of I-c*Ad
Q1 = GetBlockInv0(Ad,cRe,th,c);

%for cross-partition matrix Aod, Do low-rank-approximation
if lr~=1%lra by partition
    %split W into two matrices
    [Wd,Wod] = MatSpt(W,cRe);
    %partition on cross-partition matrix 
    %
    D2 = sum(Wod);
    np = find(D2>0);%cross-off those 
    %the following line do partition by metis
    %partition only on those non-zeros portition
    t0 = min(length(np),t);%if  the # of non-empty columns is smaller than t, shrink it.
    t = t0;
    cRe0 = METISCls(Wod(np,np),t);

    %the following line does partition by (k-way) ncut-like alg.
    %cRe0 = Ncutk(Wod(np,np),fix(log2(t))+1,0.1);
    %cRe0 = my_spec_cut(Wod(np,np),fix(log2(t))+1,[1 3]);
    %[cRe] = my_spec_cut(W,fix(log2(k))+1,[1 3]);
    
    cRe2 = sparse(size(Wod,1),1);    
    cRe2(np,1) = cRe0;
    %max(cRe2)
    [U,S,V] = LowRankAod(Aod,t,lr,cRe2);
else
    [U,S,V] = LowRankAod(Aod,t,lr);
end


%Compute another matrix inversion
if lr==1
    Lam = inv(inv(S) - c * V * Q1 * U);
else
    %note that, first: Aod = U * S^{-1} * V, NOT Aod = U * S * V as in the
    %above case; second: S might be sigular;
%     tmp = S - c * V * Q1 * U;
%     r = rank(full(tmp));
%     tmp = sparse(tmp);
%     [X,Y,Z] = svds(tmp,r);
%     Lam = Z * inv(Y) * X';

    tmp = (S - c * V * Q1 * U);
%     Lam = inv(tmp);
    [X,Y,Z] = svd(full(tmp));
    Y = diag(Y);
    pid = find(Y>10^(-6));
    len = length(pid);
%     aa(1) = len; aa(2) = size(tmp,2);
%     disp(['rank of tmp & size of tmp: ' num2str(aa)])    
%     
    X = X(:,1:len);
    Z = Z(:,1:len);
    iY = diag(1./Y(1:len));
    Lam = Z * iY * X';
    
end



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function iX = GetBlockInv0(Ad,cRe,th,c)

if nargin<4
    c = 0.95;
end
if nargin<3%threshold to further sparse the matrix
    th = 1e-4;
end

%Ad is block diagnonal according to clustering result pos
%iX = inv(I-c*Ad)

len = max(cRe)+1;
for i=1:len
    pos{i} = find(cRe==i-1);
end

I = zeros(0,3);
[m,n] = size(Ad);

for i=1:len%for every block diagonal piece
%     i
    pp = pos{i};
    tmp = Ad(pp,pp);
    a = inv(eye(length(pp))-c*tmp);
    a(find(a<=th)) = 0;%further sparse
    a = sparse(a);
    [I2(:,1),I2(:,2),I2(:,3)] = find(a);
    I2(:,1) = pp(I2(:,1));
    I2(:,2) = pp(I2(:,2));
    
    I = [I;I2];    
    clear I2;      

end
iX = spconvert(I);

[m1,n1] = size(iX);
if n1<n
    iX(n,n)=0;
end
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function [U,S,V] = LowRankAod(Aod,t,lr,cRe2);

if nargin<4
    t=1;
end
if t<=0
    [m,n] =size(Aod);
    U = sparse(m,1);
    S = sparse(1,1);
    V = sparse(1,m);
end
if lr==1% by SVD or eigen-decomposition
    Aod = sparse(Aod);
    [U,S,V] = svds(Aod,t); %%(Aod=U*S*V')
    V = V'; %(Aod=U*S*V)
else%by partition, not implemented here
    %partition Aod into t pieces (say, by metis)
    %Construct an n x t matrix U (see table 4 in the paper)
    %project Aod into the column space of U
    %Aod = U * S^{-1}*V
    for i=1:t
        pos = find(cRe2==i-1);
        U(:,i) = sum(Aod(:,pos),2);
    end
    S = U' * U;
    V = U' * Aod;
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function [Ad,Aod] = MatSpt(A,cRe)

%split matrix A into diagnal block (Ad) and off-diagonal block(Aod)
%according to the clustering results


[m,n] = size(A);


len = max(cRe)+1;


[I(:,1),I(:,2),I(:,3)] = find(A);


pos = find(cRe(I(:,1))==cRe(I(:,2)));  

Ad = spconvert(I(pos,:));

[s0,t0] = size(Ad);
if s0<m|t0<n
    Ad(m,n) = 0;
end

[m1,n1] = size(Ad);
if m1==0
    Ad = sparse(m,n);
end

Aod = A - Ad;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%log: 2008-2-22: allow the special case when the partition # is 1 now,
%which is equivalent to PreCompute method
%log: 2008-2-22: degenerate rank in lra is fixed
%log: 2008-2-22: self loop problem in METISCls.m fixed
%log; 2008-2-21: 
%      - METIS on linux fixed (thanks to Scott)
%      - If you still want to use spectal cluster to do partiton,
%      comment-out lines #34 and #62; AND un-comment lines #38 and #67
%