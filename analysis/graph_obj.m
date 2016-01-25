%%used to create graph for related objects
% author: Hope Yao, DOI lab, 12/18/2015

close all; fclose all; clear; clc

%% extract info from database
cmd_l1 = '-- this part is used to compute similarity graph ';
% wrong guesses
cmd_l2 = '\n\\COPY (SELECT guess FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''graph.txt'' csv';
% wrong guesses
cmd_l3 = '\n\\COPY (SELECT array_length(all_selected_id, 1) FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''size.txt'' csv';
% idx for wrong guesses
cmd_l4 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = false order by object_name ASC) to ''idx.txt'' csv;';
cmd = strcat(cmd_l1,cmd_l2,cmd_l3,cmd_l4);
fileID = fopen('test.sql','w');
fprintf(fileID,cmd);
fclose(fileID);
status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%%
guess=importdata('graph.txt');
gsize=importdata('size.txt');
name_pool = importdata('idx.txt');

tt_obj = 100;%less than 100 obj are there
obj_played = zeros(tt_obj,1); dbobj_num=1;
for i=1:length(name_pool)-1
    if (strcmp(cell2mat(name_pool(i)),cell2mat(name_pool(i+1)))==0)
        dbobj_num = dbobj_num + 1;
    end
    obj_played(dbobj_num) = obj_played(dbobj_num) + 1;
end
obj_played(1)=obj_played(1)+1;

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

            aaa = num_overlap;
            overlap_cnt = 1;
            while overlap_cnt<=num_overlap
                sig_close(k+overlap_cnt-1)=wrngus(extra_cluster(overlap_cnt));
                overlap_cnt = overlap_cnt + 1;
            end
            
%             if (length(extra_cluster)~=num_overlap)
%                 error('error in handling overlapping');
%             end
            k = k+num_overlap-1;
        end
        k = k + 1;
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
    end
end




