%% This parser is used to process data collected from impressionist
% author: Hope Yao, DOI lab, 12/17/2015

close all; fclose all; clear; clc

%% extract info from database
% cmd_l1 = '-- this part is used to compute entropy (object selected by human player and correctly guessed)';
% cmd_l2 = '\n\\COPY (SELECT all_selected_id FROM impressionist_result_table_amt where computer_player=false AND array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''size.txt'' csv;';
% %%%%%%%%%%%%%%%%%   NOTICE::: dont know why output M085 has vtx number 10554
% % cmd_l3 = '\n\\COPY (SELECT id,object_name,array_length(all_selected_id, 1),all_selected_id    FROM impressionist_result_table_amt where (array_length(all_selected_id, 1)<>0) order by object_name ASC) to ''idx.txt'' csv;';
% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% cmd_l3 = '\n\\COPY (SELECT object_name     FROM impressionist_result_table_amt where computer_player=false AND array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''idx.txt'' csv;';
% cmd = strcat(cmd_l1,cmd_l2,cmd_l3);
% fileID = fopen('test.sql','w');
% fprintf(fileID,cmd);
% fclose(fileID);
% status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%% read database file
sel_db = cell(1);        line_nume = 1;
fileID = fopen('size.txt','r');
if(-1==fileID)
    error('error in open database file');
end
tline = fgetl(fileID);
while ischar(tline)
    %pick out selection
    select = tline(3:length(tline)-2);
    %store selection
    fid = fopen('selection.txt','w');
    fprintf(fid,'%s',select);
    fclose(fid);
    fid = fopen('selection.txt','r');
    [tmp,~] = fscanf(fid, ['%d'  ',']);
    sel_db(line_nume,:) = {tmp+1}; %starts from 1, make index compartible
    line_nume = line_nume + 1;
    tline = fgetl(fileID);
end
fclose(fileID);

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


% for dbname_idx = 10:dbobj_num
for dbname_idx = 1:1 %THERE IS AN ERROR AT 9 and 58!!
    D = zeros(1,1);
    for played_idx = 1:obj_played(dbname_idx)
        db_line_idx = sum(obj_played(1:dbname_idx-1))+played_idx;
        obj_name = cell2mat(name_pool(db_line_idx));
        disp(dbname_idx);disp(obj_name);
        count = 1;
        if (obj_name(2)==0)
            count = length(obj_name)-1;
        end
        for i=2:length(obj_name)
            if (obj_name(i)~='0')
                break;
            end
            count = count + 1;
        end
        obj_idx = obj_name(count+1:length(obj_name));
        
        %% read mesh file, only needs to be done once
        fclose all;
        mesh_dir = '..\public\obj\Princeton\';
        if ('M'==obj_name(1))
            mesh_file = strcat(mesh_dir,strcat(obj_idx,' - Copy.json'));
        else
            mesh_file = strcat(mesh_dir,strcat(obj_idx,'.json'));
        end
        fid_mesh = fopen(mesh_file,'r');
        for i=1:3 %skip three lines
            tline = fgetl(fid_mesh);
        end
        
        % read vertex position
        num_vtx = 1; select=cell(1);
        while ischar(tline)
            tline = fgetl(fid_mesh);
            if (strcmp(tline,'		],')==1)
                break;
            end
            count = 1;
            for i=5:length(tline)
                %pick out selection
                tt = 5;
                if (tline(i)==']')
                    ttcount = count;
                end
                count = count + 1;
            end
            select(num_vtx) = {tline(tt:ttcount+3)};
            num_vtx = num_vtx + 1;
        end
        num_vtx = num_vtx - 1;
        %store selection
        A = zeros(1,3);
        fileID = fopen('vtx_selection.txt','w');
        for i=1:num_vtx
            fprintf(fileID,'%s \n',cell2mat(select(i)));
        end
        fclose(fileID);
        fileID = fopen('vtx_selection.txt','r');
        for i=1:num_vtx
            tmp = fscanf(fileID, '%g,%g,%g', 3);
            A(i,:) = tmp;
        end
        fclose(fileID);
        
        % read face composition
        tline = fgetl(fid_mesh);
        num_face = 1; select=cell(1);
        while ischar(tline)
            tline = fgetl(fid_mesh);
            if (strcmp(tline,'		],')==1)
                break;
            end
            count = 1;
            for i=5:length(tline)
                tt = 5;
                if (tline(i)==']')
                    ttcount = count;
                end
                count = count + 1;
            end
            %pick out selection
            select(num_face) = {tline(tt:ttcount+3)};
            num_face = num_face + 1;
        end
        num_face = num_face - 1;
        %store selection
        B = zeros(1,3);
        fileID = fopen('face_selection.txt','w');
        for i=1:num_face
            fprintf(fileID,'%s \n',cell2mat(select(i)));
        end
        fclose(fileID);
        fileID = fopen('face_selection.txt','r');
        for i=1:num_face
            tmp = fscanf(fileID, '%g,%g,%g', 3);
            B(i,:) = tmp;
        end
        fclose(fileID);
        B = B + 1; %make A and B have the same starting index
        save('info.txt','tt','-ascii');
        
        %% compute entropy for every play
        C = cell2mat(sel_db(db_line_idx));
        sel_vtx = zeros(length(C)*3,1);
        kk = 1;
        for i=1:length(C)
            face_idx = C(i);
            for j=1:3
                vtx_idx = B(face_idx,j);
                sel_vtx(kk) = vtx_idx;
                kk = kk + 1;
            end
        end
        sel_vtx = sort(sel_vtx);
        cnt = 1; cluster = zeros(1,3);
        D = zeros(0);
        for i=1:length(sel_vtx)-1
            if (sel_vtx(i)~=sel_vtx(i+1))
                vtx_idx = sel_vtx(i);
                cluster(cnt,:) = A(vtx_idx,:);
                cnt = cnt + 1;
                D = [D;vtx_idx];
            end
        end
        if sel_vtx(length(sel_vtx)-1)~=sel_vtx(length(sel_vtx))
            vtx_idx = sel_vtx(length(sel_vtx));
            cluster(cnt,:) = A(vtx_idx,:);
            D = [D;vtx_idx];
        end
        
        figure();
        plot(cluster(:,1),cluster(:,2),'.','MarkerSize',5);axis equal;
        saveas(gcf,strcat('./output/',num2str(db_line_idx),'.png'));close;
        
        % output for heatmap and graph generation
        if played_idx==1
            agg_sel = zeros(size(A,1),1);
        end
        sel_tmp = cell2mat(sel_db(db_line_idx));
        for jj=1:length(D)
            agg_sel(D(jj)) = agg_sel(D(jj))+1;
        end
        
    end
    % output for heatmap and graph generation
    save('aggregated.txt','agg_sel','-ascii');
    fff = fopen('obj_name_graph.txt','w');
    fprintf(fff,'%s\n',obj_name);
    fclose(fff);
    %% overall result for a object
    num_played = floor(obj_played(dbname_idx)/2);
    D = sort(D);
    cnt = 1; reduced_cluster = zeros(1,3); ss=1;
    if (0==D(1))
        ss = 2;
    end
    for i=ss:length(D)-num_played
        if (D(i)==D(i+num_played-1)&&D(i)~=D(i+num_played)) % for those have been selected for num times
            vtx_idx = D(i);
            reduced_cluster(cnt,:) = A(vtx_idx,:);
            cnt = cnt + 1;
        end
    end
    
    figure();
    plot3(reduced_cluster(:,1),reduced_cluster(:,2),reduced_cluster(:,3),'.','MarkerSize',5);
    axis equal; hold on; view(2);
    saveas(gcf,strcat('./output/',num2str(dbname_idx),'.fig'));
 

end



