% parse all test shapes using Lee et al. 2005

addpath(genpath('.\saliency-for-3d-meshes\'));
addpath('..\..\public\');
object_list = {'obj\Princeton\17.json',  'obj\Princeton\26.json', 'obj\Princeton\57.json', 'obj\Princeton\68.json',...
    'obj\Princeton\75.json','obj\Princeton\111.json', 'obj\Princeton\170.json', 'obj\Princeton\198.json',...
    'obj\Princeton\221.json', 'obj\Princeton\258.json', 'obj\Princeton\260.json', 'obj\Princeton\378.json',...
    'obj\Princeton\379.json', 'obj\Princeton\381.json', 'obj\Princeton\382.json', 'obj\Princeton\383.json',...
    'obj\Princeton\384.json', 'obj\Princeton\386.json', 'obj\Princeton\390.json', 'obj\Princeton\391.json',...
    'obj\Princeton\393.json', 'obj\Princeton\392.json', 'obj\Princeton\398.json'};

% calculate saliency from .json files
meshSaliency_all = cell(length(object_list),1);
az_all = cell(length(object_list),1);
el_all = cell(length(object_list),1);
az2_all = cell(length(object_list),1);
el2_all = cell(length(object_list),1);

for i = 1:numel(object_list)
    str = ['..\..\public\',object_list{i}];
    json2data = loadjson(str);
    v = json2data.parsed.vertexArray;
    f = json2data.parsed.faceArray+1; % index from .json starts from 0, but required to be 1 for meshSaliencyPipeline
    m = struct('v',v,'f',f);
    [meshSaliency, az, el, az2, el2] = meshSaliencyPipeline(m);
    meshSaliency_all{i} = meshSaliency;
    az_all{i} = az;
    el_all{i} = el;
    az2_all{i} = az2;
    el2_all{i} = el2;
    
    fileID = fopen(['..\..\public\obj\Princeton_saliency_distribution_Lee05\',num2str(str2num(object_list{i}(15:17))),'.val'],'wt');
    fprintf(fileID, '%f\n',meshSaliency);
    fclose(fileID);
end

save('curvature_from_Lee05.mat','meshSaliency_all','az_all','el_all','az2_all','el2_all', '-v7.3');