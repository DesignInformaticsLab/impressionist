load curvature_from_Lee05.mat


for kkk = 1:23;
    
    object_list = {'obj\Princeton\17.json',  'obj\Princeton\26.json', 'obj\Princeton\57.json', 'obj\Princeton\68.json',...
        'obj\Princeton\75.json','obj\Princeton\111.json', 'obj\Princeton\170.json', 'obj\Princeton\198.json',...
        'obj\Princeton\221.json', 'obj\Princeton\258.json', 'obj\Princeton\260.json', 'obj\Princeton\378.json',...
        'obj\Princeton\379.json', 'obj\Princeton\381.json', 'obj\Princeton\382.json', 'obj\Princeton\383.json',...
        'obj\Princeton\384.json', 'obj\Princeton\386.json', 'obj\Princeton\390.json', 'obj\Princeton\391.json',...
        'obj\Princeton\393.json', 'obj\Princeton\392.json', 'obj\Princeton\398.json'};
    idxx = [17,26,57,68,75,111,170,198,221,258,260,378,379,381,382,383,384,386,390,391,393,392,398];
    str = ['..\..\public\',object_list{kkk}];
    json2data = loadjson(str);
    v = json2data.parsed.vertexArray;
    f = json2data.parsed.faceArray+1; % index from .json starts from 0, but required to be 1 for meshSaliencyPipeline
    
    %         valdir = 'C:\doiUsers\Hope\impressionist\public\obj\Princeton_saliency_distribution_Lee05\';
    valdir = 'C:\doiUsers\Hope\impressionist\public\obj\impressionist_saliency_rv\';
    C=load(strcat(valdir,num2str(idxx(kkk)),'.val'));
    
    m = struct('v',v,'f',f);
    [az, el, az2, el2] = salientViewpoint(m, C);
    
    figure()
    trisurf(f,v(:,1),v(:,2),v(:,3),C,'LineStyle', 'none', ...
        'NormalMode','auto',...
        'BackFaceLighting','reverselit',...
        'DiffuseStrength', 0.6,...
        'SpecularExponent', 9);
    set(gca, 'FontSize', 18);
    xlabel('X');    ylabel('Y');    zlabel('Z');
    axis equal
    grid off
    %		axis off
    axis vis3d;
    axis image;
    
    % 	colormap(jet(16))
    % 	colormap(gray(16))
    colormap(jet)
    shading interp
    axis off
    
    view(az,el)
    %         view(az_all{kkk},el_all{kkk})
    savefig(strcat('az  ',num2str(idxx(kkk))))
    saveas(gcf,strcat('az  ',num2str(idxx(kkk)),'.png'))
    view(az2,el2)
    %         view(az2_all{kkk},el2_all{kkk})
    savefig(strcat('az2  ',num2str(idxx(kkk))))
    saveas(gcf,strcat('az2  ',num2str(idxx(kkk)),'.png'))
end

