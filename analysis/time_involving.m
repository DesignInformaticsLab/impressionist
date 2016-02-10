%% used to create heatmap for wrong guesses
% call graph_object.m to get highly rated wrong guesses

% note: shouldn't average over all the wrong guesses. 
% this will make the selection evenly distributed.
% instead, we should focus on each single play.

% %%%%%%%%%%%%%%%%%%%%%%%%% bad version %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% function bad_code()
% clear; clc; close all;
% 
% [ti,gsize]= graph_obj();
% for i=1:length(ti)
% % for i=2:2
%     % only consider the most likely wrong first
%     for j=1:1
%     %     for j=1:length(ti{i,3})
%         if isempty(ti{i,3})
%             continue
%         end
%         ttwgsel = [];
%         wgname = ti{i,2}{1,j};
%         wgidx = ti{i,3}{j,1};
%         wgsel = gsize(cell2mat(wgidx));
%         %assemble all and find the most frequent sel
%         for k=1:length(wgsel)
%             ttwgsel = [ ttwgsel wgsel{k,1} ];
%         end
%         [a,~] = sort(ttwgsel);
%         [idx_len,~]=count_result(num2cell(a));
%         [~,d] = sort(idx_len,'descend');
%         partial_size = ceil(length(ttwgsel)/length(wgsel));
%         partial_wgsel = d(1:partial_size);
%         %mesh those selections
%         figure();
%         partial_mesh(sort(partial_wgsel),ti{i,4});
%         title(strcat(strcat(ti{i,1},' -> '),wgname));
%     end
% end
% 
% end
% 
% function partial_mesh(sel_idx,obj_name)
% 
% fclose all;
% mesh_dir = '..\public\obj\Princeton\';
% obj_name = obj_name{1};
% count = 1;
% if (obj_name(2)==0)
%     count = length(obj_name)-1;
% end
% for i=2:length(obj_name)
%     if (obj_name(i)~='0')
%         break;
%     end
%     count = count + 1;
% end
% obj_idx = obj_name(count+1:length(obj_name));
% % change M111 to M112
% if(strcmp(obj_name,'M111')==1)
%     obj_name='M112';
%     obj_idx='112';
% end
% 
% if ('M'==obj_name(1))
%     mesh_file = strcat(mesh_dir,strcat(obj_idx,' - Copy.json'));
% else
%     mesh_file = strcat(mesh_dir,strcat(obj_idx,'.json'));
% end
% fid_mesh = fopen(mesh_file,'r');
% for i=1:3 %skip three lines
%     tline = fgetl(fid_mesh);
% end
% 
% % read vertex position
% num_vtx = 1; select=cell(1);
% while ischar(tline)
%     tline = fgetl(fid_mesh);
%     if (strcmp(tline,'		],')==1)
%         break;
%     end
%     count = 1;
%     for i=5:length(tline)
%         %pick out selection
%         tt = 5;
%         if (tline(i)==']')
%             ttcount = count;
%         end
%         count = count + 1;
%     end
%     select(num_vtx) = {tline(tt:ttcount+3)};
%     num_vtx = num_vtx + 1;
% end
% num_vtx = num_vtx - 1;
% %store selection
% A = zeros(1,3);
% fileID = fopen('vtx_selection.txt','w');
% for i=1:num_vtx
%     fprintf(fileID,'%s \n',cell2mat(select(i)));
% end
% fclose(fileID);
% fileID = fopen('vtx_selection.txt','r');
% for i=1:num_vtx
%     tmp = fscanf(fileID, '%g,%g,%g', 3);
%     A(i,:) = tmp;
% end
% fclose(fileID);
% 
% % read face composition
% tline = fgetl(fid_mesh);
% num_face = 1; select=cell(1);
% while ischar(tline)
%     tline = fgetl(fid_mesh);
%     if (strcmp(tline,'		],')==1)
%         break;
%     end
%     count = 1;
%     for i=5:length(tline)
%         tt = 5;
%         if (tline(i)==']')
%             ttcount = count;
%         end
%         count = count + 1;
%     end
%     %pick out selection
%     select(num_face) = {tline(tt:ttcount+3)};
%     num_face = num_face + 1;
% end
% num_face = num_face - 1;
% %store selection
% B = zeros(1,3);
% fileID = fopen('face_selection.txt','w');
% for i=1:num_face
%     fprintf(fileID,'%s \n',cell2mat(select(i)));
% end
% fclose(fileID);
% fileID = fopen('face_selection.txt','r');
% for i=1:num_face
%     tmp = fscanf(fileID, '%g,%g,%g', 3);
%     B(i,:) = tmp;
% end
% fclose(fileID);
% B = B + 1; %make A and B have the same starting index
% 
% % C=load(strcat(obj_idx,'.val'));
% % trisurf(B,A(:,1),A(:,2),A(:,3),C,'LineStyle', 'none', ...
% BB = B(sel_idx,:);
% trisurf(BB,A(:,1),A(:,2),A(:,3),'LineStyle', 'none', ...
%     'NormalMode','auto',...
%     'BackFaceLighting','reverselit',...
%     'DiffuseStrength', 0.6,...
%     'SpecularExponent', 9);
% set(gca, 'FontSize', 18);
% xlabel('X');    ylabel('Y');    zlabel('Z');
% axis equal
% grid off
% axis vis3d;
% axis image;
% % colormap(jet)
% shading interp
% axis off
% end

%%%%%%%%%%%%%%%%%%%%%%%%% good version %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function time_involving()
clear; clc

%% extract data from database
dbinfo = db_extract();

%% analyse data
% for correct answers
% idx_len: number of guesses for each object
% cnt: total objects in this database
[idx_len1,cnt1] = count_result(dbinfo{1});
assert(sum(idx_len1)==length(dbinfo{1}));
%for wrong answers
[idx_len2,cnt2] = count_result(dbinfo{2});
assert(sum(idx_len2)==length(dbinfo{2}));

% for i=1:cnt1
for i=1:1 %only use one object here to test
    % find all coresponding wrong guesses for a correct guess
    ti = find_close_wrngus(i,idx_len1,idx_len2,cnt2,dbinfo);
    %find the most frequent guesses, sorted
    [name_close,idx_correct,idx_wrong] = find_most_frquent(ti);

end


for i=1:1 %only use one object here to test
for i=1:cnt1
    [name_close,idx_correct,idx_wrong] = find_most_frquent(ti);
end
end
end

function ti = find_close_wrngus(i,idx_len1,idx_len2,cnt2,dbinfo)
% assum no obj has number of wrong guesses larger than 500
% idx of wrong guess, content of wrong guess, idx of related correct guess

idx1 = dbinfo(1);	idx1 = idx1{1};
idx2 = dbinfo(2);    idx2 = idx2{1};
row1 = dbinfo(3);    row1 = row1{1};
row2 = dbinfo(4);    row2 = row2{1};
guess1 = dbinfo(5);  guess1 = guess1{1};
guess2 = dbinfo(6);  guess2 = guess2{1};

ti = cell(500,3);
num = 1;
for j=1:cnt2
    if strcmp(cell2mat(idx1(i)),cell2mat(idx2(j)))==1 %correct and wrong guess for a particular obj
        start_idx1 = sum(idx_len1(1:i-1));
        end_idx1 = sum(idx_len1(1:i));
        if 0==start_idx1
            start_idx1=1;
        end
        start_idx2 = sum(idx_len2(1:j-1));
        end_idx2 = sum(idx_len2(1:j));
        if 0==start_idx2
            start_idx2=1;
        end
        
        for k=start_idx1:end_idx1
            for kk=start_idx2:end_idx2
                if (row1(k)==row2(kk)+1)
                    disp([k,kk]);
                    disp([guess1(k),guess2(kk)]);
                    %store for further analysis
                    ti(num,:)={kk,cell2mat(guess2(kk)),k};
                    num = num+1;
                end
            end
        end
    end    
end

end

function [name_close,idx_correct,idx_wrong] = find_most_frquent(ti)
tii = (ti(:,2));
wrngus = tii(~cellfun('isempty',tii));

%         wrngus = lower(wrngus);
y = zeros(size(wrngus));
for k = 1:length(wrngus)
    for kk = 1:length(wrngus)
        y(k) = y(k) + strcmp(wrngus(k),wrngus(kk));
    end
end

[b,num] = sort(y,'descend');
cnt = 1; cluster = zeros(1);
for k=1:length(b)-1
    if (b(k)~=b(k+1))
        cluster(cnt) = b(k);
        if(sum(cluster)~=k)
            tt = (k-sum(cluster))/cluster(cnt);
            cluster(cnt:cnt+tt)=cluster(cnt);
            cnt = cnt + tt;
        end
        cnt = cnt + 1;
    end
end
ttnum = 0; threshold = 0.01;%only number of wrong guess larger than this is considered significant
for k=1:length(cluster)
    if cluster(k)>threshold*length(y)
        ttnum = ttnum+1;
    end
end

sig_close = cell(1); cnt = 1;
% idx_close = [];
idx_wrong = [];idx_correct = [];
for k=1:ttnum
    for kk=1:length(b)
        if (b(kk)==cluster(k))
            sig_close(cnt) = wrngus(num(kk));
            idx_wrong = [idx_wrong,ti(num(kk),1)];
            idx_correct = [idx_correct,ti(num(kk),3)];
            cnt = cnt + 1;
            break;
        end
    end
end

k = 1;
while k<length(cluster)
    if cluster(k)==cluster(k+1)
        tmp = zeros(0);
        for kk=1:length(y)
            if y(kk)==cluster(k)
                tmp = [tmp,kk];
            end
        end
        %add those objects to new sig_close
        for jj=1:length(tmp)
            for kk=jj+1:length(tmp)
                if(tmp(jj)~=0&&tmp(kk)~=0)
                    if strcmp(wrngus(tmp(kk)),wrngus(tmp(jj)))
                        tmp(kk) =  0;
                    end
                end
            end
        end
        extra_cluster = nonzeros(tmp);
        
        num_overlap = 0;
        for kk=k:length(cluster)
            if cluster(kk)==cluster(k)
                num_overlap = num_overlap+1; %find those overlaps out
            end
        end
        
        overlap_cnt = 1;
        while overlap_cnt<=num_overlap
            sig_close(k+overlap_cnt-1)=wrngus(extra_cluster(overlap_cnt));
            %             idx_wrong(k+overlap_cnt-1) = ti(extra_cluster(overlap_cnt),1);
            idx_correct(k+overlap_cnt-1) = ti(extra_cluster(overlap_cnt),3);
            overlap_cnt = overlap_cnt + 1;
        end
        
        %             if (length(extra_cluster)~=num_overlap)
        %                 error('error in handling overlapping');
        %             end
        k = k+num_overlap-1;
    end
    k = k + 1;
end
name_close = sig_close;
end

function dbinfo = db_extract()
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  computer_player=false AND
% correct
cmd_l2 = '\n\\COPY (SELECT guess     FROM impressionist_result_table_amt where computer_player=false AND  array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''guess1.txt'' csv;';
% wrong
cmd_l4 = '\n\\COPY (SELECT guess      FROM impressionist_result_table_amt where computer_player=false AND array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''guess2.txt'' csv;';

% correct
cmd_l1 = '\n\\COPY (SELECT object_name     FROM impressionist_result_table_amt where computer_player=false AND  array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''idx1.txt'' csv;';
% wrong
cmd_l3 = '\n\\COPY (SELECT object_name      FROM impressionist_result_table_amt where computer_player=false AND array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''idx2.txt'' csv;';

% correct
cmd_l5 = '\n\\COPY (SELECT row_number() over()     FROM impressionist_result_table_amt where computer_player=false AND  array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''row1.txt'' csv;';
% wrong
cmd_l6 = '\n\\COPY (SELECT row_number() over()      FROM impressionist_result_table_amt where computer_player=false AND array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''row2.txt'' csv;';

cmd = strcat(cmd_l1,cmd_l2,cmd_l3,cmd_l4,cmd_l5,cmd_l6);
fileID = fopen('test.sql','w');
fprintf(fileID,cmd);
fclose(fileID);
% from the "double player" database
status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%% load data
% correct
idx1 = importdata('idx1.txt');
row1 = importdata('row1.txt');
guess1 = importdata('guess1.txt'); guess1 = lower(guess1);
% wrong
idx2 = importdata('idx2.txt');
row2 = importdata('row2.txt');
guess2 = importdata('guess2.txt'); guess2 = lower(guess2);

dbinfo = {idx1,idx2,row1,row2,guess1,guess2};
end

function [idx_len,cnt]=count_result(idx)
cnt=1;
idx_len=zeros(length(idx),1);
for i=1:length(idx)-1
    if strcmp(cell2mat(idx(i)),cell2mat(idx(i+1))) %|| any(1-cell2mat(idx(i))==cell2mat(idx(i+1)))
        idx_len(cnt) = idx_len(cnt)+1;
    else
        idx_len(cnt) = idx_len(cnt)+1;
        cnt = cnt+1;
    end
end
idx_len(cnt) = idx_len(cnt) + 1; % add 1 to last entry
idx_len(idx_len == 0) = []; % remove zeros
end


