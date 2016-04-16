%% plot cloud of the object some revealing percentage

% input: extracted from database inside function
% output: shown in command window
% author: Hope Yao, DOI lab, 02/18/2016
% unfinished

function  method_compare_cloud()
close all; fclose all; clear; clc

pct_sel = method_compare();


% %% extract info from database
% % object_name in total
% cmd_l2 = '\n\\COPY (SELECT object_name FROM impressionist_object_table_amt  order by object_name ASC) to ''obj_name.txt'' csv';
% % human
% cmd_l3 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = false AND correct = true order by object_name ASC) to ''human_idx.txt'' csv';
% % princeton (with random revaled obj skipped)
% cmd_l4 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = true AND correct = true AND object_name<>''M002'' AND object_name<>''M055'' AND object_name<>''P392'' AND object_name<>''P398'' order by object_name ASC) to ''princeton_idx.txt'' csv';
% cmd = strcat(cmd_l2,cmd_l3,cmd_l4);
% fileID = fopen('test.sql','w');
% fprintf(fileID,cmd);
% fclose(fileID);
% status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%% read database file
human_idx = importdata('human_idx.txt');
princeton_idx = importdata('princeton_idx.txt');
obj_idx = importdata('obj_name.txt');

% change M111 to M112
for i=1:length(obj_idx)
    if(strcmp(cell2mat(obj_idx(i)),'M111')==1)
        obj_idx(i)={'M112'};
    end
end
for i=1:length(human_idx)
    if(strcmp(cell2mat(human_idx(i)),'M111')==1)
        human_idx(i)={'M112'};
    end
end
for i=1:length(princeton_idx)
    if(strcmp(cell2mat(princeton_idx(i)),'M111')==1)
        princeton_idx(i)={'M112'};
    end
end

%% cmputing........
for method_idx = 1:2
    switch method_idx
        case 1
            name_pool = human_idx;
        case 2
            name_pool = princeton_idx;
    end
    
    tt_obj = length(obj_idx);%less than 100 obj are there
    obj_played = zeros(tt_obj,1);
    for j=1:length(obj_idx)
        dbobj_num=0;
        try
            for i=1:length(name_pool)
                if (strcmp(cell2mat(obj_idx(j)),cell2mat(name_pool(i)))==1)
                    dbobj_num = dbobj_num + 1;
                end
            end
        catch
            disp([j i]);
        end
        obj_played(j) = dbobj_num;
    end
    assert(sum(obj_played)==length(name_pool));
    
    % for i=1:dbobj_num
    for i=38:38
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
        filename_idx = obj_name(count+1:length(obj_name));
        
        if(strcmp(obj_name,'M735')==1)
            continue;
        end
        if(strcmp(obj_name,'P035')==1)
            continue;
        end
        %     if(strcmp(obj_name,'P183')==1)
        %         continue;
        %     end
        if(strcmp(obj_name,'P385')==1)
            continue;
        end
        if(strcmp(obj_name,'P400')==1)
            continue;
        end
        
        switch method_idx
            case 1
                var_dir = '..\public\obj\Princeton_saliency_distribution_Chen\imp\';
            case 2
                var_dir = '..\public\obj\Princeton_saliency_distribution_Chen\orig\';
        end
        
        if ('M'==obj_name(1))
            %         js_file = strcat(js_dir,strcat(obj_idx,' - Copy.js'))
        else
            val_file = strcat(var_dir,strcat(filename_idx,'.val'));
            val = load(val_file);
        end
        
        % only reveal 4 percent of faces for object#38 
        pct = 0.04;
        [~,b]=sort(val,'descend');
        lwbd = length(val);
        upbd = ceil(lwbd*pct);
        val( b(upbd:lwbd) ) = 0;
        val_file = strcat(strcat(var_dir,'partial\'),strcat(filename_idx,'.val'));
        save(val_file,'val','-ascii');
    end
    
end

end
