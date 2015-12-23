%%compare human, random and pricenton selection
% author: Hope Yao, DOI lab, 12/20/2015

close all; fclose all; clear; clc

%% extract info from database

cmd_line1 = '-- this part is used to compare result for human, random and priceton selection';
% human
cmd_line2 = '\n\\COPY (SELECT array_length(all_selected_id, 1) FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = false AND correct = true order by object_name ASC) to ''human.txt'' csv';
cmd_line3 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = false AND correct = true order by object_name ASC) to ''human_idx.txt'' csv';
% random
cmd_line4 = '\n\\COPY (SELECT array_length(all_selected_id, 1) FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = true AND correct = true AND (object_name=''M002'' OR object_name=''M055'' OR object_name=''P392'' OR object_name=''P398'') order by object_name ASC) to ''random.txt'' csv';
cmd_line5 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = true AND correct = true AND (object_name=''M002'' OR object_name=''M055'' OR object_name=''P392'' OR object_name=''P398'') order by object_name ASC) to ''random_idx.txt'' csv';
% pricenton
cmd_line6 = '\n\\COPY (SELECT array_length(all_selected_id, 1) FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = true AND correct = true AND object_name<>''M002'' AND object_name<>''M055'' AND object_name<>''P392'' AND object_name<>''P398'' order by object_name ASC) to ''princeton.txt'' csv';
cmd_line7 = '\n\\COPY (SELECT object_name FROM impressionist_result_table_amt where array_length(all_selected_id, 1)<>0 AND computer_player = true AND correct = true AND object_name<>''M002'' AND object_name<>''M055'' AND object_name<>''P392'' AND object_name<>''P398'' order by object_name ASC) to ''princeton_idx.txt'' csv';
% obj idx
cmd_line8 = '\n\\COPY (SELECT object_name FROM impressionist_object_table_amt  order by object_name ASC) to ''obj_name.txt'' csv';
cmd_line9 = '\n\\COPY (SELECT face_per_mesh[1] FROM impressionist_object_table_amt  order by object_name ASC) to ''face_per_mesh.txt'' csv';
cmd = strcat(cmd_line1,cmd_line2,cmd_line3,cmd_line4,cmd_line5,cmd_line6,cmd_line7,cmd_line8,cmd_line9);
fileID = fopen('test.sql','w');
fprintf(fileID,cmd);
fclose(fileID);
status = system('psql -U postgres -d mylocaldb1 -a -f TEST.sql','-echo');

%% load data
human_idx = importdata('human_idx.txt');
human_idx(length(human_idx)+1)={'null'};% for covinience
human_sel = importdata('human.txt');

random_idx = importdata('random_idx.txt');
random_idx(length(random_idx)+1)={'null'};
random_sel = importdata('random.txt');

princeton_idx = importdata('princeton_idx.txt');
princeton_idx(length(princeton_idx)+1)={'null'};
princeton_sel = importdata('princeton.txt');

obj_idx = importdata('obj_name.txt');
num_face = importdata('face_per_mesh.txt');

for compare_idx = 1:3
    
    switch compare_idx
        case 1
            any_idx = human_idx;
            any_sel = human_sel;
        case 2
            any_idx = random_idx;
            any_sel = random_sel;
        case 3
            any_idx = princeton_idx;
            any_sel = princeton_sel;
    end
    
    num_wrong = zeros(length(obj_idx),1);
    for i=1:length(obj_idx)
        cnt = 1; count1 = 0;
        for j=1:length(any_idx)-1
            if strcmp(cell2mat(any_idx(j)),cell2mat(obj_idx(i)))==1
                count1 = cnt;break;
            end
            cnt = cnt + 1;
        end
        cnt = 1; count2 = 0;
        for j=count1:length(any_idx)-1
            if strcmp(cell2mat(any_idx(j+1)),cell2mat(obj_idx(i)))==0
                count2 = cnt;
                break;
            end
            cnt = cnt + 1;
        end
%         if (i==1 && count1==1)
%             count2 = 0;
%         end
        if (count1==0)
            continue;
        end
%                 disp(i);
%                 disp(count1);
%                 disp(count1+count2-1);
%                 disp(any_idx(count1:count1+count2-1));
        num_wrong(i) = count2;
    end
%     num_wrong(1) = num_wrong(1) - 1;
    
    sel = cell(length(obj_idx),1); 
    avg_sel = zeros(length(obj_idx),1); 
    var_sel = zeros(length(obj_idx),1); 
    for i=1:length(obj_idx)
        tmp=zeros(0);
        tt = sum(num_wrong(1:i-1));
        for j=tt+1:tt+num_wrong(i)
            tmp = [tmp, any_sel(j)];
        end
        sel(i) = {tmp} ;
        
        tmp = cell2mat(sel(i));
        if length(tmp)<3
            avg_sel(i) = 0;
            var_sel(i) = 0;
        else
            avg_sel(i) = (sum(tmp)-max(tmp)-min(tmp))/(length(tmp)-2)/num_face(i);%average in percentage
            var_sel(i) = var(tmp)/num_face(i);%variance
            
        end
        
    end
    f1=figure(1);plot(avg_sel,'*'); hold on; grid on; 
    f2=figure(2);plot(var_sel,'*'); hold on; grid on; 
end
figure(1);
axis([0,60,0.0001,0.3]); legend('human', 'random', 'pricenton');
xlabel('object idx'); ylabel('average revealing percentage');
saveas(f1,'./output/compare_avg.fig');saveas(f1,'./output/compare_avg.png');
figure(2);
axis([0,60,1,300]); legend('human', 'random', 'pricenton');
xlabel('object idx'); ylabel('variance revealing percentage');
saveas(f2,'./output/compare_var.fig');saveas(f2,'./output/compare_var.png');
%%




