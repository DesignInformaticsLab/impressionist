function r = BBLin_OQ(M,Lam,c,qIdx,qTp)


%BB_Lin Alg: On-Query Stage
%M,Lam: pre-computed matraces by BLin_Pre, 
%M: n x m; two types of objects (n objects 'a'; m objects 'b')
%c: 1-c restart prob
%qIdx/qTp: the query to be answered
%for BBLin_Pre BBLin_OQ/BBLin_OQ1: we have to use graph laplacian as
%normalization method(otherwise, the P matrix is no longer sysmmetric).
%Note that we can still get the similar alg if we use other kinds of
%normalization; --but we have to change the code!


[n,m] = size(M);

%tic;
if qTp==12%return (i,j)^th element in the whole T = (1-c)*inv(I-cA) matrix
    i = qIdx(1);
    j = qIdx(2);
    if i<=n 
        if j<=n
            qTp = 8;
            qIdx = [i,j];
        else
            qTp = 10;
            qIdx = [i,j-n];
        end
    else
        if j<=n
            qTp = 9;
            qIdx = [i-n,j];
        else
            qTp = 11;
            qIdx = [i-n,j-n];
        end
    end
end
%
if qTp==1%given i^th object 'a', return the steady-state prob for all objects 'a' and 'b'
    i=qIdx;    
    %e2 = sparse(m,1);    
    e1 = sparse(n,1);
    e1(i) = 1;
    t1 = (Lam * (M' * e1));
    
    r1 = (1-c) * (c^2 * (M * t1) + e1);
    r2 = (1-c) * c * t1;
    
    r = [r1;r2];
    
elseif qTp==2 %given i^th object 'a', return the steady-state prob for all objects 'a'
    i=qIdx;    
    %e2 = sparse(m,1);    
    e1 = sparse(n,1);
    e1(i) = 1;
    t1 = (Lam * (M' * e1));
    
    r = (1-c) * (c^2 * (M * t1) + e1);    
elseif qTp==3 %given i^th object 'a', return the steady-state prob for all objects 'b'
    i=qIdx;    
    %e2 = sparse(m,1);    
    e1 = sparse(n,1);
    e1(i) = 1;
    t1 = (Lam * (M' * e1));
    
    
    r = (1-c) * c * t1;    
elseif qTp==4 %return  (1-c) x inv(I-cA) x q.idx (here qIdx is a vector)
    ei = qIdx;
    e1 = ei(1:n,1);
    e2 = ei(n+1:end,1);
    
    t1 = Lam * (M' * e1);
    t2 = Lam * e2;
    
    r1 = (1 - c) * (e1 + c * (M * (c* t1 + t2)));
    r2 = (1 - c) * (c * t1 + t2);
    r = [r1;r2];
    
elseif qTp==5 %given i^th object 'b', return the steady-state prob for all objects 'a' and 'b'
    i=qIdx;    
    e2 = sparse(m,1);
    e2(i) = 1;
    
    t2 = Lam * e2;
    
    r1 = (1 - c) * c * (M * t2);
    r2 = (1 - c) * (t2);
    r = [r1;r2];
elseif qTp==6%given i^th object 'b', return the steady-state prob for all objects 'a'
    i=qIdx;    
    e2 = sparse(m,1);
    e2(i) = 1;
    
    t2 = Lam * e2;
    
    r = (1 - c) * c * (M * t2);
elseif qTp==7%given i^th object 'b', return the steady-state prob for all objects 'b'
    i=qIdx;    
    e2 = sparse(m,1);
    e2(i) = 1;
    
    t2 = Lam * e2;
    
    r = (1 - c) * (t2);

%Now, start to compute one elements in T = (1-c)*inv(I-cA) =[T11 T12;T21,T22]
elseif qTp==8%given j^th object 'a', return the steady-state prob in i^th object 'a'
    %i.e. (i,j)^th element in T11
    i = qIdx(1);
    j = qIdx(2);
    %e1 = sparse(n,1);
    %e1(j) = 1;
    %t1 = (Lam * (M' * e1));
    t1 = Lam * M(j,:)';
    
    if j~=i
        r = (1-c) * (c^2 * (M(i,:) * t1));
    else
        r = (1-c) * (c^2 * (M(i,:) * t1) + 1);
    end
elseif qTp==9%given j^th object 'a', return the steady-state prob in i^th object 'b'
    %i.e. (i,j)^th element in T21
    %e1 = sparse(n,1);
    i = qIdx(1);
    j = qIdx(2);
    %e1(j) = 1;
    %t1 = (Lam(i,:) * (M' * e1)); 
    t1 = Lam(i,:) * M(j,:)'; 
    
    r = (1-c) * c * t1;
elseif qTp==10%%given j^th object 'b', return the steady-state prob in i^th object 'a'
    %i.e. (i,j)^th element in T12
    i = qIdx(1);
    j = qIdx(2);
    %e2 = sparse(m,1);
    %e2(j) = 1;
    
    %t2 = Lam * e2;
    t2 = Lam(:,j);
    
    r = (1 - c) * c * (M(i,:) * t2);
elseif qTp==11%%given j^th object 'b', return the steady-state prob in i^th object 'b'
    %i.e. (i,j)^th element in T22
    i = qIdx(1);
    j = qIdx(2);
    %e2 = sparse(m,1);
    %e2(j) = 1;
    %e1 = sparse(1:n);
    %t2 = Lam(i,:) * e2;
    t2 = Lam(i,j);
    
    r = (1 - c) * t2;
end
%toc;