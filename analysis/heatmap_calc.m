%% genereate heatmap and calculate entropy of them based on human2human plays
% uses following file: DbParser.m, heatmapfile_generator.m,
% entropy_calculation.m

% note: changed M111 to M112, this may cause problem in future comparison

function heatmap_calc()
clear;
% extract info from database
dbextract();
% max_obj_num = 56;
a = [1];
for idx = a%9 28 30 40 49
    
    cd('C:\doiUsers\Hope\impressionist\analysis');
    DbParser(idx);
    
    cd('./FastRWR-out');
    heatmap_generator();
    
    entropy_calculation(idx);
end
end

function dbextract()
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

%% extract info from database, single amt player version
cmd_l1 = '-- this part is used to compute entropy (object selected by human player and correctly guessed)';
cmd_l2 = '\n\\COPY (SELECT all_selected_id FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''size.txt'' csv;';
%%%%%%%%%%%%%%%%%   NOTICE::: dont know why output M085 has vtx number 10554
% cmd_l3 = '\n\\COPY (SELECT id,object_name,array_length(all_selected_id, 1),all_selected_id    FROM impressionist_result_table_amt where (array_length(all_selected_id, 1)<>0) order by object_name ASC) to ''idx.txt'' csv;';
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
cmd_l3 = '\n\\COPY (SELECT object_name     FROM impressionist_result_table_amt where  array_length(all_selected_id, 1)<>0 AND correct = true order by object_name ASC) to ''idx.txt'' csv;';
cmd = strcat(cmd_l1,cmd_l2,cmd_l3);
fileID = fopen('test.sql','w');
fprintf(fileID,cmd);
fclose(fileID);
status = system('psql -U postgres -d mylocaldb_amt_single -a -f TEST.sql','-echo');

end