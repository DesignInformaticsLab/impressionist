clear; clc;
pct_sel=method_compare();
clc;
for iii=33:59
    x=cell2mat(pct_sel(1,iii));
%     x(x == max(x)) = []; % remove max
%     x(x == min(x)) = []; % remove min
    y = cell2mat(pct_sel(4,iii));
%     y(y == max(y)) = []; % remove max
%     y(y == min(y)) = []; % remove min
    if (~isempty(x))&&(~isempty(y))
        h=ttest2(x,y, 'vartype','unequal');
        if ~isnan(h) && h
            disp([iii,length(x),length(y),mean(x),mean(y)]);
        end
    end
end
