
%% read aggregated selection
sel_db = cell(1);        line_nume = 1;
aggregated = importdata('aggregated.txt');  %every row represents a object

%% read statistics for every object
name_pool = importdata('obj_name.txt');

%% read mesh for every object
for dbname_idx = 1:1 %THERE IS AN ERROR AT 9 and 58!!
    obj_name = cell2mat(name_pool(dbname_idx));
    disp(dbname_idx);disp(obj_name);
    
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
    mesh_dir = '..\public\obj\Princeton\';
    if ('M'==obj_name(1))
        mesh_file = strcat(mesh_dir,strcat(obj_idx,'85 - Copy.json'));
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
    
end