%% generate tree structure. needs to run after DbParser.m
clear; clc;

%% read aggregated selection
sel_db = cell(1);        line_nume = 1;
aggregated = importdata('../aggregated.txt');  %every row represents a object

%% read statistics for every object
name_pool = importdata('../obj_name_graph.txt');

%% read mesh for every object
for dbname_idx = 1:1 %THERE IS AN ERROR AT 9 and 58!!
    obj_name = cell2mat(name_pool(dbname_idx));
    disp(dbname_idx);disp(obj_name);
%     selection = aggregated(dbname_idx);
    % detect meshfile name from index
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
    fclose all;
    mesh_dir = '..\..\public\obj\Princeton\';
    if ('M'==obj_name(1))
        mesh_file = strcat(mesh_dir,strcat(obj_idx,' - Copy.json'));
    else
        mesh_file = strcat(mesh_dir,strcat(obj_idx,'.json'));
    end
    fid_mesh = fopen(mesh_file,'r');
    for i=1:3 %skip three lines
        tline = fgetl(fid_mesh);
    end
    
    tt = load('../info.txt');
    num_vtx = tt(1);    num_face = tt(2);
    % read vertex position
    vtx = zeros(1,3);
    fileID = fopen('../vtx_selection.txt','r');
    for i=1:num_vtx
        tmp = fscanf(fileID, '%g,%g,%g', 3);
        vtx(i,:) = tmp;
    end
    fclose(fileID);
    
    % read face composition
    face = zeros(1,3);
    fileID = fopen('../face_selection.txt','r');
    for i=1:num_face
        tmp = fscanf(fileID, '%g,%g,%g', 3);
        face(i,:) = tmp;
    end
    fclose(fileID);
    
    assert(num_vtx==length(aggregated));
    % use aggregated data and select(vtx position) to generate
    % unipartite graph, need to take face info into consideration
    W = zeros(num_vtx);
    for i=1:num_face
        vtx_num1 = face(i,1)+1;
        vtx_num2 = face(i,2)+1;
        vtx_num3 = face(i,3)+1;
        v1 = (vtx(vtx_num1));
        v2 = (vtx(vtx_num2));
        v3 = (vtx(vtx_num3));
        if(W(vtx_num1,vtx_num2)==0)
            W(vtx_num1,vtx_num2)= norm(v1-v2,2);
        else
            W(vtx_num1,vtx_num2)= min(norm(v1-v2,2),W(vtx_num1,vtx_num2));            
        end
        if(W(vtx_num1,vtx_num2)==0)
            W(vtx_num2,vtx_num3)= min(norm(v3-v2,2),W(vtx_num2,vtx_num3));
        end
        if(W(vtx_num1,vtx_num2)==0)
            W(vtx_num1,vtx_num3)= min(norm(v1-v3,2),W(vtx_num1,vtx_num3));
        end
    end
    W = (W+W')/2;
    % process this graph for heatmap
    %     [Q1,U,V,Lam,t0] = BLin_Pre(W,para);
    [Q1,U,V,Lam,t0] = BLin_Pre(W);
    c=0.3; i=1;
    [r, qt] = BLin_OQ(Q1,U,V,Lam,c,i,W,k0);
end