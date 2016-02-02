%% used to create graph for related objects
% input: extracted from database inside function
% output: shown in command window
% author: Hope Yao, DOI lab, 12/18/2015

function [ti,sel_db] = graph_obj()
close all; fclose all; clear; clc

%% extract info from database
cmd_l1 = '-- this part is used to compute similarity graph ';
% wrong guesses
cmd_l2 = '\n\\COPY (SELECT guess FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''graph.txt'' csv';
% wrong guesses
cmd_l3 = '\n\\COPY (SELECT all_selected_id FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''size.txt'' csv';
% idx for wrong guesses
cmd_l4 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''idx.txt'' csv;';
cmd = strcat(cmd_l1,cmd_l2,cmd_l3,cmd_l4);
fileID = fopen('test.sql','w');
fprintf(fileID,cmd);
fclose(fileID);
status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%% read database file

guess=importdata('graph.txt');
name_pool = importdata('idx.txt');
% gsize=importdata('size.txt');

sel_db = cell(1);        line_nume = 1;
fileID = fopen('size.txt','r');
if(-1==fileID)
    error('error in open database file');
end
tline = fgetl(fileID);
while ischar(tline)
    %pick out selection
    select = tline(3:length(tline)-2);
    %clean up
    sel_db(line_nume,:) = {str2num(select)};
    line_nume = line_nume + 1;
    tline = fgetl(fileID);
end
fclose(fileID);

%% cmputing........
tt_obj = 100;%less than 100 obj are there
obj_played = zeros(tt_obj,1); dbobj_num=1;
for i=1:length(name_pool)-1
    if (strcmp(cell2mat(name_pool(i)),cell2mat(name_pool(i+1)))==0)
        dbobj_num = dbobj_num + 1;
    end
    obj_played(dbobj_num) = obj_played(dbobj_num) + 1;
end
obj_played(1)=obj_played(1)+1;

ti = cell(dbobj_num,4);

for i=1:dbobj_num
    wrngus = cell(obj_played(i),1);
    for j=1:obj_played(i)
        idx = sum(obj_played(1:i-1)) + j;
        wrngus(j) = lower(guess(idx));
    end
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
    for k=1:ttnum
        for kk=1:length(b)
            if (b(kk)==cluster(k))
                sig_close(cnt) = wrngus(num(kk));
                cnt = cnt + 1;
                break;
            end
        end
    end
    
    idx_wrong = cell(ttnum,1);
    for k=1:ttnum
        tmp = cell(1);  cnt = 1;
        for kk=1:length(b)
            if (b(kk)==cluster(k))
                tmp(cnt) = {sum(obj_played(1:i-1)) + num(kk)};
                cnt = cnt + 1;
            end
        end
        idx_wrong(k) = {tmp};
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
            
            
            %             num_overlap1 = num_overlap;
            num_overlap=0;
            for kk=k:length(cluster)
                if cluster(kk)==cluster(k)
                    num_overlap = num_overlap+1; %find those overlaps out
                end
            end
            extra_cluster = nonzeros(tmp);
            
            %             overlap_cnt = 1;
            %             while overlap_cnt<=num_overlap
            %                 sig_close(k+overlap_cnt-1)= wrngus(extra_cluster(overlap_cnt));
            %                 overlap_cnt = overlap_cnt + 1;
            %             end
            %             if (length(extra_cluster)~=num_overlap)
            %                 error('error in handling overlapping');
            %             end
            
            %add those objects to new sig_close
            %             overlap_cnt = 1;
            %             for jj=1:length(tmp)
            %                 for kk=jj+1:length(tmp)
            %                     if(tmp(jj)~=0&&tmp(kk)~=0)
            %                         if strcmp(wrngus(tmp(kk)),wrngus(tmp(jj)))
            % %                             atmp = cell(num_overlap,1);
            % %                             for kkk=1:num_overlap
            % %                                 atmp(kkk) = {sum(obj_played(1:i-1)) + extra_cluster(kkk)};
            % %                             end
            %                             idx_wrong(k+cnt) = {sum(obj_played(1:i-1)) + tmp(jj)};
            %                             tmp(kk) =  0;
            %                         else
            %                             overlap_cnt = overlap_cnt+1;
            %                         end
            %                     end
            %                 end
            %             end
            [a,b]=sort(wrngus(tmp));
            try
                for jj=1:num_overlap %that many set
                    %                 assert((mod(length(b)/num_overlap))==0);
                    setsize = length(b)/num_overlap;
                    sig_close(k+jj-1) = a(1+(jj-1)*setsize);
                    kk=1+(jj-1)*setsize:jj*setsize; %each with this many item
                    idx_wrong(k+jj-1) = {num2cell(b(kk))};
                end
            catch
                disp([length(b) num_overlap]);
            end
            k = k+num_overlap;
        else
            k = k + 1;
        end
    end
    
    %read correct answer from js file
    obj_name = cell2mat(name_pool(sum(obj_played(1:i))));
    count = 1;
    if (obj_name(2)==0)
        count = length(obj_name)-1;
    end
    for ii=2:length(obj_name)
        if (obj_name(ii)~='0')
            break;
        end
        count = count + 1;
    end
    obj_idx = obj_name(count+1:length(obj_name));
    % change M111 to M112
    if(strcmp(obj_name,'M111')==1)
        obj_name='M112';
        obj_idx='112';
    end
    if(strcmp(obj_name,'M735')==1)
        continue;
    end
    if(strcmp(obj_name,'P035')==1)
        continue;
    end
    if(strcmp(obj_name,'P183')==1)
        continue;
    end
    if(strcmp(obj_name,'P385')==1)
        continue;
    end
    if(strcmp(obj_name,'P400')==1)
        continue;
    end
    
    js_dir = '..\public\obj\Princeton\';
    if ('M'==obj_name(1))
        js_file = strcat(js_dir,strcat(obj_idx,' - Copy.js'));
    else
        js_file = strcat(js_dir,strcat(obj_idx,'.js'));
    end
    
    
    fid_mesh = fopen(js_file,'r');
    for ii=1:3 %read the third line
        tline = fgetl(fid_mesh);
    end
    count = 1;
    for ii=1:length(tline)
        %pick out selection
        if (tline(ii)=='[')
            ttcount1 = count;
        end
        if (tline(ii)==']')
            ttcount2 = count;
        end
        count = count + 1;
    end
    correct_answer = tline(ttcount1+1:ttcount2-1);
    
    %     disp(strcat('obj_name: ',num2str(cell2mat(name_pool(sum(obj_played(1:i)))))));
    if (length(sig_close)>1)
        disp(strcat('idx: ',num2str(i)));
        disp(correct_answer);
        disp(obj_played(i));
        disp(sig_close);
        disp(cluster(1:ttnum));
        disp(idx_wrong(1:ttnum));
    end
    ti(i,:) = {correct_answer,sig_close,idx_wrong,name_pool(sum(obj_played(1:i-1))+1)};
end

end


