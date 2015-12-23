function cRe = METISCls(W,k)


%remove self loop
W = (triu(W,1) + tril(W,-1));
[m,n] = size(W);
if k==m%every node is partition
    cRe = [1:m]-1;
    return;
elseif k==1
    cRe = zeros(m,1);
    return;
end
W2MetisInput(W);

if ispc, shell = 'dos'; else, shell = 'unix'; end                %  Which OS ?

[m,n] = size(W);
if k>m
    k=m;
end

metis = '(''./kmetis MeIn_metis.txt ';


cmnd = strcat([shell metis ' ' num2str(k) ''')']);

status = eval(cmnd); 

if status==0
    cRe=-1%error;
    return;
end

cmnd2 = 'load MeIn_metis.txt.part';
cmnd2 = strcat([cmnd2 '.' num2str(k)]);
eval(cmnd2);
cRe = MeIn_metis;



function W2MetisInput(W,fname,iToInt)

%convert metrix to METIS Input

if nargin<3
    iToInt = 0;
end
if nargin<2
    fname = 'MeIn';
end

[m,n] = size(W);
if iToInt ~=0%turn the weight into integrate
    W(find(W<0.000001)) = 0;
    W = round(W * 1000000);    
end
    W = (W + W')/2;
    W = sparse(W);

fname = [fname '_metis.txt'];
fid1 = fopen(fname,'w');
if fid1>0
    fprintf(fid1, '%d %d 1\n',m,nnz(W)/2);
    
else
    return;
end


%try to do it columnise, this should be much better (faster) than row-wise
%for large graphs.
W = W';
for i=1:m
    pos  = find(W(:,i)>0);
    for j=1:length(pos)
        fprintf(fid1,'%d %d ',pos(j),W(pos(j),i));
        
    end
    fprintf(fid1,'\n');
    
end

% for i=1:m
%     pos  = find(W(i,:)>0);
%     for j=1:length(pos)
%         fprintf(fid1,'%d %d ',pos(j),W(i,pos(j)));
%         
%     end
%     fprintf(fid1,'\n');
%     
% end


fclose(fid1);