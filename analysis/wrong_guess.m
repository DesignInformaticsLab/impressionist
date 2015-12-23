tmp1 = load('test.txt');
% tmp2 = load('idx.txt');
x(idx) = {tmp1};


tmp2 = load('idx.txt');
y(idx) = {tmp2};

idx = idx + 1;


for i=1:59
    xx(i) = length(cell2mat(x(i)));
    yy(i) = length(cell2mat(y(i)));
end
