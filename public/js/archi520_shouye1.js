//创建3D模型
var container, stats;
var camera, controls, scene, renderer;
var initobj, curhouse;
var door_pregeo, win_pregeo, win_premat;
var premesh_win, geopre_sofa;
var prewin_width=112, prewin_height=160, prewin_thick=23;
var predoor_width=102, predoor_height=210, predoor_thick=23;
var material_floor, material_wall;
var material_door, material_window;

var radius = 100, theta = 0;


//获取建筑图纸信息
var xmlhttp;
var jsonhouse;

function gethouse(hstr)
{
    xmlhttp=null;
    if (window.XMLHttpRequest) xmlhttp=new XMLHttpRequest(); // code for Firefox, Opera, IE7, etc.
    else if (window.ActiveXObject) xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5

    if (xmlhttp!=null){
        xmlhttp.onreadystatechange=function(){house_info()};

        var hurl="/info_"+hstr;
        xmlhttp.open("GET",hurl,true);
        xmlhttp.send(null);
    }else{
        alert("Your browser does not support XMLHTTP.");
    }
}
function house_info()
{
    if (xmlhttp.readyState==4){// 4 = "loaded"
        if (xmlhttp.status==200){// 200 = "OK" 
            jsonhouse=JSON.parse(xmlhttp.responseText);
            create_house();
        }else{
            alert("Problem retrieving data:" + xmlhttp.statusText);
        }
    }
}

function create_house()
{
   // document.getElementById("ptxt1").innerHTML=hstr;

    //清空场景 
    scene.remove(curhouse);
    //清空数组
    objects=[];

    //创建floor1.cemo
    curhouse=new THREE.Object3D();

    var archi_info=jsonhouse.cemo_scene.archi_info;
    var floor_x=archi_info.sizex, floor_z=archi_info.sizez;
    var maxfloor;
    if(floor_x>floor_z) maxfloor=floor_x;
    else maxfloor=floor_z;
    var uvsize=Math.ceil(maxfloor/1000)*1000;

    //create floor
    var floor = new THREE.PlaneGeometry(floor_x, floor_z, 2, 2);
    //material_floor = new THREE.MeshLambertMaterial({color:0x999999, side: THREE.DoubleSide});
    //var material_floor = new THREE.MeshLambertMaterial({map:texture_floor, side: THREE.DoubleSide});
    var mesh_floor = new THREE.Mesh(floor, material_floor);
    mesh_floor.position.set(0,0,1);
    mesh_floor.rotation.set(-Math.PI/2,0,0);

    mesh_floor.castShadow=true;
    mesh_floor.receiveShadow=true;
    curhouse.add(mesh_floor);

    
    var archi_wall=jsonhouse.cemo_scene.archi_scene.archi_wall;
    var archi_window=jsonhouse.cemo_scene.archi_scene.archi_window;                
    var archi_door=jsonhouse.cemo_scene.archi_scene.archi_door;
    //var material_wall = new THREE.MeshLambertMaterial({color:0xC1C1C1, side: THREE.DoubleSide});//浅灰
    //var material_wall = new THREE.MeshLambertMaterial({map:texture_wall, side: THREE.DoubleSide});

    var wall_height=archi_wall[0].height;

    if(archi_wall)
    {//create wall            
        for(var i=0;i<archi_wall.length;i++)
        {
            var altitude=archi_wall[i].altitude;
            var height=archi_wall[i].height;
            var thickness=archi_wall[i].thickness;
            //document.getElementById("ptxt1").innerHTML="altitude is "+altitude+", height is "+height+", thickness is "+thickness;

            //jsonhouse.cemo_scene.aux_scene.aux_polyline[0].id;
            var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
            for(var j=0; j<aux_polyline.length; j++)
            {
                if(archi_wall[i].id == aux_polyline[j].id)
                {
                    var dx=aux_polyline[j].point[0].x-aux_polyline[j].point[1].x;
                    var dy=aux_polyline[j].point[0].y-aux_polyline[j].point[1].y;//dy=0
                    var dz=aux_polyline[j].point[0].z-aux_polyline[j].point[1].z;
                    var width=0, angle=0, startp=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                            if(dz>0) startp=aux_polyline[j].point[1].z;
                            else startp=aux_polyline[j].point[0].z;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                            startp=startp*width/dx;
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    } 

                    startp=Math.round(startp)
                    thickness=Math.round(thickness);
                    height=Math.round(height);
                    altitude=Math.round(altitude);

                    width+=thickness-1;
                    startp-=thickness/2;

                    var wall = new THREE.CubeGeometry(width, height, thickness); 

                    //uv映射
                    var front = [new THREE.Vector2(startp/uvsize, 0), new THREE.Vector2((startp+width)/uvsize, 0), 
                                 new THREE.Vector2((startp+width)/uvsize, height/uvsize), new THREE.Vector2(startp/uvsize, height/uvsize)];
                    var back = [new THREE.Vector2(startp/uvsize, (height+thickness)/uvsize), new THREE.Vector2((startp+width)/uvsize, (height+thickness)/uvsize), 
                                new THREE.Vector2((startp+width)/uvsize, (height*2+thickness)/uvsize), new THREE.Vector2(startp/uvsize, (height*2+thickness)/uvsize)];
                    var left = [new THREE.Vector2((startp-thickness)/uvsize, 0), new THREE.Vector2(startp/uvsize, 0), 
                                new THREE.Vector2(startp/uvsize, height/uvsize), new THREE.Vector2((startp-thickness)/uvsize, height/uvsize)];
                    var right = [new THREE.Vector2((startp+width)/uvsize, 0), new THREE.Vector2((startp+width+thickness)/uvsize, 0), 
                                new THREE.Vector2((startp+width+thickness)/uvsize, height/uvsize), new THREE.Vector2((startp+width)/uvsize, 0), height/uvsize];
                    var top = [new THREE.Vector2(startp/uvsize, height/uvsize), new THREE.Vector2((startp+width)/uvsize, height/uvsize), 
                               new THREE.Vector2((startp+width)/uvsize, (height+thickness)/uvsize), new THREE.Vector2(startp/uvsize, (height+thickness)/uvsize)];
                    var bottom = [new THREE.Vector2(startp/uvsize, (height*2+thickness)/uvsize), new THREE.Vector2((startp+width)/uvsize, (height*2+thickness)/uvsize), 
                                  new THREE.Vector2((startp+width)/uvsize, (height+thickness)*2/uvsize), new THREE.Vector2(startp/uvsize, (height+thickness)*2/uvsize)];

                    wall.faceVertexUvs[0] = [];
                    
                    wall.faceVertexUvs[0][0] = [ right[3], right[0], right[2] ];
                    wall.faceVertexUvs[0][1] = [ right[0], right[1], right[2] ];
                    
                    wall.faceVertexUvs[0][2] = [ left[3], left[0], left[2] ];
                    wall.faceVertexUvs[0][3] = [ left[0], left[1], left[2] ];
                    
                    wall.faceVertexUvs[0][4] = [ top[3], top[0], top[2] ];
                    wall.faceVertexUvs[0][5] = [ top[0], top[1], top[2] ];
                    
                    wall.faceVertexUvs[0][6] = [ bottom[3], bottom[0], bottom[2] ];
                    wall.faceVertexUvs[0][7] = [ bottom[0], bottom[1], bottom[2] ];
                    
                    wall.faceVertexUvs[0][8] = [ front[3], front[0], front[2] ];
                    wall.faceVertexUvs[0][9] = [ front[0], front[1], front[2] ];
                    
                    wall.faceVertexUvs[0][10] = [ back[1], back[2], back[0] ];
                    wall.faceVertexUvs[0][11] = [ back[2], back[3], back[0] ];


                    var mesh_wall = new THREE.Mesh(wall,material_wall);

                    mesh_wall.rotateY(-angle);
                    mesh_wall.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall.position.y=height/2+altitude;
                    mesh_wall.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall.castShadow=true;
                    mesh_wall.receiveShadow=true;
                    curhouse.add(mesh_wall);
                    break;
                }
            }
        }        
    }

    if(archi_window)
    {//create window 
        for(var i=0;i<archi_window.length;i++)
        {
            var altitude=archi_window[i].altitude;
            var height=archi_window[i].height;
            var wall_height=archi_window[i].wall_height;
            var thickness=archi_window[i].thickness;

            var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
            for(var j=0; j<aux_polyline.length; j++)
            {
                if(archi_window[i].id == aux_polyline[j].id)
                {
                    var dx=aux_polyline[j].point[0].x-aux_polyline[j].point[1].x;
                    var dy=aux_polyline[j].point[0].y-aux_polyline[j].point[1].y;//dy=0
                    var dz=aux_polyline[j].point[0].z-aux_polyline[j].point[1].z;
                    var width=0, angle=0, startp=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                            if(dz>0) startp=aux_polyline[j].point[1].z;
                            else startp=aux_polyline[j].point[0].z;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                            startp=startp*width/dx;
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    }

                    thickness=Math.round(thickness);
                    height=Math.round(height);
                    wall_height=Math.round(wall_height);
                    altitude=Math.round(altitude);
                    startp=Math.round(startp);

                    width=width-thickness+1;
                    startp+=thickness/2;

                    var wall_down = new THREE.CubeGeometry(width, altitude, thickness);

                    var front = [new THREE.Vector2(startp/uvsize, 0), 
                                 new THREE.Vector2((startp+width)/uvsize, 0), 
                                 new THREE.Vector2((startp+width)/uvsize, altitude/uvsize), 
                                 new THREE.Vector2(startp/uvsize, altitude/uvsize)];
                    var back = [new THREE.Vector2(startp/uvsize, (wall_height*2-altitude+thickness)/uvsize), 
                                new THREE.Vector2((startp+width)/uvsize, (wall_height*2-altitude+thickness)/uvsize), 
                                new THREE.Vector2((startp+width)/uvsize, (wall_height*2+thickness)/uvsize), 
                                new THREE.Vector2(startp/uvsize, (wall_height*2+thickness)/uvsize)];
                    var left = [new THREE.Vector2((startp-thickness)/uvsize, 0), 
                                new THREE.Vector2(startp/uvsize, 0), 
                                new THREE.Vector2(startp/uvsize, altitude/uvsize), 
                                new THREE.Vector2((startp-thickness)/uvsize, altitude/uvsize)];
                    var right = [new THREE.Vector2((startp+width)/uvsize, 0), 
                                new THREE.Vector2((startp+width+thickness)/uvsize, 0), 
                                new THREE.Vector2((startp+width+thickness)/uvsize, altitude/uvsize), 
                                new THREE.Vector2((startp+width)/uvsize, altitude/uvsize)];
                    var top = [new THREE.Vector2(startp/uvsize, altitude/uvsize), 
                               new THREE.Vector2((startp+width)/uvsize, altitude/uvsize), 
                               new THREE.Vector2((startp+width)/uvsize, (altitude+thickness)/uvsize), 
                               new THREE.Vector2(startp/uvsize, (altitude+thickness)/uvsize)];
                    var bottom = [new THREE.Vector2(startp/uvsize, (altitude*2+thickness)/uvsize), 
                                  new THREE.Vector2((startp+width)/uvsize, (altitude*2+thickness)/uvsize), 
                                  new THREE.Vector2((startp+width)/uvsize, (altitude+thickness)*2/uvsize), 
                                  new THREE.Vector2(startp/uvsize, (altitude+thickness)*2/uvsize)];

                    wall_down.faceVertexUvs[0] = [];
                    
                    wall_down.faceVertexUvs[0][0] = [ right[3], right[0], right[2] ];
                    wall_down.faceVertexUvs[0][1] = [ right[0], right[1], right[2] ];
                    
                    wall_down.faceVertexUvs[0][2] = [ left[3], left[0], left[2] ];
                    wall_down.faceVertexUvs[0][3] = [ left[0], left[1], left[2] ];
                    
                    wall_down.faceVertexUvs[0][4] = [ top[3], top[0], top[2] ];
                    wall_down.faceVertexUvs[0][5] = [ top[0], top[1], top[2] ];
                    
                    wall_down.faceVertexUvs[0][6] = [ bottom[3], bottom[0], bottom[2] ];
                    wall_down.faceVertexUvs[0][7] = [ bottom[0], bottom[1], bottom[2] ];
                    
                    wall_down.faceVertexUvs[0][8] = [ front[3], front[0], front[2] ];
                    wall_down.faceVertexUvs[0][9] = [ front[0], front[1], front[2] ];
                    
                    wall_down.faceVertexUvs[0][10] = [ back[1], back[2], back[0] ];
                    wall_down.faceVertexUvs[0][11] = [ back[2], back[3], back[0] ];


                    var up_height=Math.round(wall_height-altitude-height);
                    var wall_up = new THREE.CubeGeometry(width, up_height, thickness);    

                    //uv映射
                    front = [new THREE.Vector2(startp/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize), 
                             new THREE.Vector2(startp/uvsize, wall_height/uvsize)];
                    back = [new THREE.Vector2(startp/uvsize, (wall_height+thickness)/uvsize), 
                            new THREE.Vector2((startp+width)/uvsize, (wall_height+thickness)/uvsize), 
                            new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness)/uvsize), 
                            new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness)/uvsize)];
                    left = [new THREE.Vector2((startp-thickness)/uvsize, (wall_height-up_height)/uvsize), 
                            new THREE.Vector2(startp/uvsize, (wall_height-up_height)/uvsize), 
                            new THREE.Vector2(startp/uvsize, wall_height/uvsize), 
                            new THREE.Vector2((startp-thickness)/uvsize, wall_height/uvsize)];
                    right = [new THREE.Vector2((startp+width)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width+thickness)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width+thickness)/uvsize, wall_height/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize)];
                    top = [new THREE.Vector2(startp/uvsize, wall_height/uvsize), 
                           new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize), 
                           new THREE.Vector2((startp+width)/uvsize, (wall_height+thickness)/uvsize), 
                           new THREE.Vector2(startp/uvsize, (wall_height+thickness)/uvsize)];
                    bottom = [new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness)/uvsize), 
                              new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness)/uvsize), 
                              new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness*2)/uvsize), 
                              new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness*2)/uvsize)];

                    wall_up.faceVertexUvs[0] = [];
                    
                    wall_up.faceVertexUvs[0][0] = [ right[3], right[0], right[2] ];
                    wall_up.faceVertexUvs[0][1] = [ right[0], right[1], right[2] ];
                    
                    wall_up.faceVertexUvs[0][2] = [ left[3], left[0], left[2] ];
                    wall_up.faceVertexUvs[0][3] = [ left[0], left[1], left[2] ];
                    
                    wall_up.faceVertexUvs[0][4] = [ top[3], top[0], top[2] ];
                    wall_up.faceVertexUvs[0][5] = [ top[0], top[1], top[2] ];
                    
                    wall_up.faceVertexUvs[0][6] = [ bottom[3], bottom[0], bottom[2] ];
                    wall_up.faceVertexUvs[0][7] = [ bottom[0], bottom[1], bottom[2] ];
                    
                    wall_up.faceVertexUvs[0][8] = [ front[3], front[0], front[2] ];
                    wall_up.faceVertexUvs[0][9] = [ front[0], front[1], front[2] ];
                    
                    wall_up.faceVertexUvs[0][10] = [ back[1], back[2], back[0] ];
                    wall_up.faceVertexUvs[0][11] = [ back[2], back[3], back[0] ];

                    //var mesh_win=premesh_win.clone();
                    var mesh_win=new THREE.Mesh(win_pregeo, material_window);

                    var win_scale=new THREE.Object3D();
                    win_scale.add(mesh_win);
                    win_scale.scale.x=(width)/prewin_width;

                    var mesh_wall_down= new THREE.Mesh(wall_down,material_wall);
                    var mesh_wall_up= new THREE.Mesh(wall_up,material_wall);

                    win_scale.rotateY(-angle);
                    mesh_wall_down.rotateY(-angle);
                    mesh_wall_up.rotateY(-angle);

                    win_scale.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    win_scale.position.y=altitude+1;
                    win_scale.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_down.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_down.position.y=altitude/2;
                    mesh_wall_down.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_wall_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_win.castShadow=true;
                    mesh_win.receiveShadow=true;
                    mesh_wall_down.castShadow=true;
                    mesh_wall_down.receiveShadow=true;
                    mesh_wall_up.castShadow=true;
                    mesh_wall_up.receiveShadow=true;

                    curhouse.add(win_scale);
                    curhouse.add(mesh_wall_down);                            
                    curhouse.add(mesh_wall_up);

                    break;
                }
            }
        }        
    }        

    if(archi_door)
    {//create door          
        for(var i=0;i<archi_door.length;i++)
        {
            var altitude=archi_door[i].altitude;
            var height=archi_door[i].height;
            var thickness=archi_door[i].thickness;

            var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
            for(var j=0; j<aux_polyline.length; j++)
            {
                if(archi_door[i].id == aux_polyline[j].id)
                {
                    var dx=aux_polyline[j].point[0].x-aux_polyline[j].point[1].x;
                    var dy=aux_polyline[j].point[0].y-aux_polyline[j].point[1].y;//dy=0
                    var dz=aux_polyline[j].point[0].z-aux_polyline[j].point[1].z;
                    //document.getElementById("ptxt1").innerHTML+=", dx is "+dx+", dy is "+dy+", dz is "+dz;
                    var width=0, angle=0, startp=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                            if(dz>0) startp=aux_polyline[j].point[1].z;
                            else startp=aux_polyline[j].point[0].z;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                            if(dx>0) startp=aux_polyline[j].point[1].x;
                            else startp=aux_polyline[j].point[0].x;
                            startp=startp*width/dx;
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    }

                    thickness=Math.round(thickness);
                    height=Math.round(height);
                    wall_height=Math.round(wall_height);
                    altitude=Math.round(altitude);
                    startp=Math.round(startp);

                    width=width-thickness+1;
                    startp+=thickness/2;
                    
                    var up_height=Math.round(wall_height-altitude-height);                
                    var door_up = new THREE.CubeGeometry(width, up_height, thickness);    

                    var temp_bg=up_height+wall_height+thickness;
                    var temp=(up_height+wall_height+thickness)/uvsize;

                    //uv映射
                    var front = [new THREE.Vector2(startp/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize), 
                             new THREE.Vector2(startp/uvsize, wall_height/uvsize)];
                    var back = [new THREE.Vector2(startp/uvsize, (wall_height+thickness)/uvsize), 
                            new THREE.Vector2((startp+width)/uvsize, (wall_height+thickness)/uvsize), 
                            new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness)/uvsize), 
                            new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness)/uvsize)];
                    var left = [new THREE.Vector2((startp-thickness)/uvsize, (wall_height-up_height)/uvsize), 
                            new THREE.Vector2(startp/uvsize, (wall_height-up_height)/uvsize), 
                            new THREE.Vector2(startp/uvsize, wall_height/uvsize), 
                            new THREE.Vector2((startp-thickness)/uvsize, wall_height/uvsize)];
                    var right = [new THREE.Vector2((startp+width)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width+thickness)/uvsize, (wall_height-up_height)/uvsize), 
                             new THREE.Vector2((startp+width+thickness)/uvsize, wall_height/uvsize), 
                             new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize)];
                    var top = [new THREE.Vector2(startp/uvsize, wall_height/uvsize), 
                           new THREE.Vector2((startp+width)/uvsize, wall_height/uvsize), 
                           new THREE.Vector2((startp+width)/uvsize, (wall_height+thickness)/uvsize), 
                           new THREE.Vector2(startp/uvsize, (wall_height+thickness)/uvsize)];
                    var bottom = [new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness)/uvsize), 
                              new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness)/uvsize), 
                              new THREE.Vector2((startp+width)/uvsize, (up_height+wall_height+thickness*2)/uvsize), 
                              new THREE.Vector2(startp/uvsize, (up_height+wall_height+thickness*2)/uvsize)];

                    door_up.faceVertexUvs[0] = [];
                    
                    door_up.faceVertexUvs[0][0] = [ right[3], right[0], right[2] ];
                    door_up.faceVertexUvs[0][1] = [ right[0], right[1], right[2] ];
                    
                    door_up.faceVertexUvs[0][2] = [ left[3], left[0], left[2] ];
                    door_up.faceVertexUvs[0][3] = [ left[0], left[1], left[2] ];
                    
                    door_up.faceVertexUvs[0][4] = [ top[3], top[0], top[2] ];
                    door_up.faceVertexUvs[0][5] = [ top[0], top[1], top[2] ];
                    
                    door_up.faceVertexUvs[0][6] = [ bottom[3], bottom[0], bottom[2] ];
                    door_up.faceVertexUvs[0][7] = [ bottom[0], bottom[1], bottom[2] ];
                    
                    door_up.faceVertexUvs[0][8] = [ front[3], front[0], front[2] ];
                    door_up.faceVertexUvs[0][9] = [ front[0], front[1], front[2] ];
                    
                    door_up.faceVertexUvs[0][10] = [ back[1], back[2], back[0] ];
                    door_up.faceVertexUvs[0][11] = [ back[2], back[3], back[0] ];


                    var mesh_door = new THREE.Mesh(door_pregeo,material_door);
                    var door_scale = new THREE.Object3D();
                    door_scale.add(mesh_door);
                    door_scale.scale.x=width/predoor_width;
                    door_scale.scale.y=height/predoor_height;

                    var mesh_door_up= new THREE.Mesh(door_up,material_wall);

                    door_scale.rotateY(-angle);
                    mesh_door_up.rotateY(-angle);

                    door_scale.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    door_scale.position.y=0;
                    door_scale.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_door_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_door_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_door_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_door.castShadow = true;
                    mesh_door.receiveShadow = true;
                    mesh_door_up.castShadow=true;
                    mesh_door_up.receiveShadow=true;

                    curhouse.add(door_scale);
                    curhouse.add(mesh_door_up);
                    break;
                }
            }
        }        
    }

    //testObj();
    scene.add(curhouse);
}


//创建3D模型
function init() {
    scene = new THREE.Scene();

    // renderer
    //renderer = new THREE.WebGLRenderer( { antialias: false } );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setClearColor(0x8ECEE7, 1.0);//浅蓝色
    //renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = true;


        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( 0xf0f0f0 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.sortObjects = false;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;

        renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );


    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );//resize侦听器对onWindowResize()函数进行了回调

    stats = new Stats();
    //stats.setMode(1); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '40px';
    document.getElementById('container').appendChild(stats.domElement);
}

var ortho=0;

function initCamera(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 1200;
    camera.position.y = 800;
    camera.position.z = 1200;

    controls = new THREE.OrbitControls(camera);
    // controls.addEventListener('change', render);//change侦听器对render()函数进行了回调
}

function change_camera(i){
    if(i==0){
        if(ortho!=0){
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.x = 1200;
            camera.position.y = 800;
            camera.position.z = 1200;

            controls = new THREE.OrbitControls(camera);
            controls.addEventListener('change', render);//change侦听器对render()函数进行了回调     

            ortho=0;
        }
    }
    else if(i==1){
        if(ortho!=1){
            camera = new THREE.OrthographicCamera( -window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, - 2000, 5000 );
            camera.position.x = 1200;
            camera.position.y = 800;
            camera.position.z = 1200;

            controls = new THREE.OrbitControls(camera);
            controls.addEventListener('change', render);//change侦听器对render()函数进行了回调 

            ortho=1;       
        }
    }
}

function change_rotate(i){
    // switch(i){
    //     case 0: curhouse.rotation.y -= Math.PI/6; break;
    //     case 1: curhouse.rotation.y += Math.PI/6; break;
    //     case 2: curhouse.rotation.x -= Math.PI/6; break;
    //     case 3: curhouse.rotation.x += Math.PI/6; break;
    // }

    switch(i){
        case 0: curhouse.rotation.y -= Math.PI/6; break;
        case 1: curhouse.rotation.y += Math.PI/6 ; break;
        case 2: camera.position.y+=300; break;
        case 3: camera.position.y-=300; break;
    }

}

function zoom_in(){
    if(ortho){
        curhouse.scale.x *= 1.5;
        curhouse.scale.y *= 1.5;
        curhouse.scale.z *= 1.5;
        // camera.position.x /= 1.5;
        // camera.position.y /= 1.5;
        // camera.position.z /= 1.5;   
    }
    else{
        camera.position.x /= 1.5;
        camera.position.y /= 1.5;
        camera.position.z /= 1.5;          
    }
}

function zoom_out(){
    if(ortho){
        curhouse.scale.x /= 1.5;
        curhouse.scale.y /= 1.5;
        curhouse.scale.z /= 1.5;
    }
    else{
        camera.position.x *= 1.5;
        camera.position.y *= 1.5;
        camera.position.z *= 1.5;
    }
}

function change_view(i){//改变视图
    if(ortho){//正投影
        curhouse.scale.x = 1;
        curhouse.scale.y = 1;
        curhouse.scale.z = 1;

        // camera.position.x = Math.cos( Math.PI/4 ) * 2000;
        // camera.position.z = Math.sin(  Math.PI/4 ) * 2000;

    switch(i){
        case 0: camera.position.x = 0; camera.position.y = 0; camera.position.z = 2000; break; //front
        case 1: camera.position.x = 0; camera.position.y = 0; camera.position.z = -2000; break; //back
        case 2: camera.position.x = -2000; camera.position.y = 0; camera.position.z = 0; break; //left
        case 3: camera.position.x = 2000; camera.position.y = 0; camera.position.z = 0; break;//right
        case 4: camera.position.x = 0; camera.position.y = 2500; camera.position.z = 0; break; //top
        case 5: camera.position.x = 1200; camera.position.y = 1200; camera.position.z = 1200; break;
    }

    }
    else{//透视相机
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

    switch(i){
        case 0: camera.position.x = 0; camera.position.y = 100; camera.position.z = 2000; break; //front
        case 1: camera.position.x = 0; camera.position.y = 100; camera.position.z = -2000; break; //back
        case 2: camera.position.x = -2000; camera.position.y = 100; camera.position.z = 0; break; //left
        case 3: camera.position.x = 2000; camera.position.y = 100; camera.position.z = 0; break;//right
        case 4: camera.position.x = 0; camera.position.y = 2500; camera.position.z = 0; break; //top
        case 5: camera.position.x = 1200; camera.position.y = 1200; camera.position.z = 1200; break;
    }


    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
    }
}

function initLight(){
    // light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 1, 1, 1 );
    // light.target=curhouse;
    // light.castShawdow=true;
    // scene.add( light );

    // light = new THREE.DirectionalLight( 0xA1A1A1 );
    // light.position.set( -1, -1, -1 );
    // light.castShawdow=true;
    // scene.add( light );

    // light = new THREE.AmbientLight( 0x222222 );
    // light.castShawdow=true;
    // scene.add( light );

/////////////////////////////////////////////////////////////////////////////////////
                scene.add( new THREE.AmbientLight( 0x969696, 0.8 ) );

                // var light = new THREE.SpotLight( 0xffffff, 0.5 );
                // light.position.set( 0, 2000, 0 );
                // light.castShadow = true;

                // light.shadowCameraNear = 200;
                // light.shadowCameraFar = camera.far;
                // light.shadowCameraFov = 50;

                // light.shadowBias = -0.00022;

                // light.shadowMapWidth = 2048;
                // light.shadowMapHeight = 2048;
/////////////////////////////////////////////////////////////////////////////////////////


                light = new THREE.DirectionalLight( 0xdfebff, 0.75 );
                light.position.set( 500, 1000, 500 );
                light.position.multiplyScalar( 1.3 );
                light.castShadow = true;
                light.shadow.mapSize.width = 2048;
                light.shadow.mapSize.height = 2048;
                var d = 2000;
                light.shadow.camera.left = - d;
                light.shadow.camera.right = d;
                light.shadow.camera.top = d;
                light.shadow.camera.bottom = - d;
                light.shadow.camera.far = 10000;
                scene.add( light );

////////////////////////////////////////////////////////////////////////////////////////////


    // var light = new THREE.SpotLight(0xffff00, 1, 100, -Math.PI / 6, 25);
    // light.position.set(0, 100, 100);
    // light.target = curhouse;
    // light.castShadow = true;

    // light.shadowCameraNear = 200;
    // light.shadowCameraFar = 1000;
    // light.shadowCameraFov = 3000;
    // light.shadowCameraVisible = true;

    // light.shadowMapWidth = 1024;
    // light.shadowMapHeight = 1024;
    // light.shadowDarkness = 0.3;

    scene.add(light);
}

var uvscale_floor=10;
var uvscale_wall=10;
var objects = [], plane;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;

function initLoad(){
    var texture_wall = new THREE.TextureLoader().load("textures/wall/wall_0.png" );
    texture_wall.wrapS = THREE.RepeatWrapping;
    texture_wall.wrapT = THREE.RepeatWrapping;
    texture_wall.repeat.set( uvscale_wall, uvscale_wall );
    material_wall = new THREE.MeshLambertMaterial({map:texture_wall, side: THREE.DoubleSide});

    var texture_floor = new THREE.TextureLoader().load("textures/floor/ground_0.png" );
    texture_floor.wrapS = THREE.RepeatWrapping;
    texture_floor.wrapT = THREE.RepeatWrapping;
    texture_floor.repeat.set( uvscale_floor, uvscale_floor );
    material_floor = new THREE.MeshLambertMaterial({map:texture_floor, side: THREE.DoubleSide});


    var loader = new THREE.JSONLoader();

    loader.load(
        // resource URL
        'models/door.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            door_pregeo=geometry;
        }
    );

    // instantiate a loader
    var win_loader = new THREE.JSONLoader();

    // load a resource
    win_loader.load(
        // resource URL
        'models/wink.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            var material = new THREE.MultiMaterial( materials );
            win_pregeo=geometry;
            win_premat=material;
            premesh_win = new THREE.Mesh(geometry,material);
        }
    );

    material_window = new THREE.MeshLambertMaterial({color:0xA1A1A1, side: THREE.DoubleSide});//中灰                
    material_door = new THREE.MeshLambertMaterial({color:0xa3c7eb, side: THREE.DoubleSide});//棕色0x8B4500  

    //testObj();
}


function initObject(){
    curhouse=new THREE.Object3D();
    var title_obj=new THREE.Object3D();

    var floor = new THREE.PlaneGeometry(1600, 1600, 2, 2);
    var material1 = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff });
    var mesh_floor = new THREE.Mesh(floor, material1);
    mesh_floor.position.set(0,0,0);
    mesh_floor.rotation.set(-3.14/2,0,0);
    mesh_floor.castShadow=true;
    mesh_floor.receiveShadow=true;
    //scene.add(mesh_floor);
    curhouse.add(mesh_floor);

    //init obj
    var title_loader = new THREE.JSONLoader();

    title_loader.load(
        // resource URL
        'models/title_sm3.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            geometry.scale(20,20,20);
            var title_mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
            title_mesh.position.set(0, 200, 400);
            title_mesh.rotation.x=-Math.PI/8;
            title_mesh.castShadow=true;
            title_mesh.receiveShadow=true;
            title_obj.add(title_mesh);
        }
    );
   

    //随机生成正方体
    var geometry = new THREE.BoxGeometry( 20, 20, 20 );

    for ( var i = 0; i < 100; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 1600 - 800;
        object.position.y = Math.random() * 300;
        object.position.z = Math.random() * 400 - 400;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        title_obj.add( object );

        objects.push( object );

    }
    title_obj.rotation.y=Math.PI/4;
    curhouse.add(title_obj);
    scene.add(curhouse);


    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
        new THREE.MeshBasicMaterial( { visible: false } )
    );
    scene.add( plane );
}

function testObj(){

    scene.remove(curhouse);
    //清空数组
    objects=[];

    //创建floor1.cemo
    curhouse=new THREE.Object3D();

    var geometry = new THREE.BoxGeometry( 40, 40, 40 );

    for ( var i = 0; i < 50; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600 - 300;
        object.position.z = Math.random() * 800 - 400;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        curhouse.add( object );

        objects.push( object );

    }

    var geometry = new THREE.PlaneGeometry( 1600, 1600 );
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({map:texture_floor}) );
    // object.position.x = 0;
    // object.position.y = 0;
    // object.position.z = 0;
    //var material_floor = new THREE.MeshBasicMaterial({map:texture_floor, side: THREE.DoubleSide});
    //new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff, map: texture_floor } )

    object.position.set(0,1,0);
    object.rotation.set(-3.14/2,0,0);

    object.castShadow = true;
    object.receiveShadow = true;

    curhouse.add( object );
    scene.add(curhouse);

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//交互

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //

    raycaster.setFromCamera( mouse, camera );

    if ( SELECTED ) {

        var intersects = raycaster.intersectObject( plane );

        if ( intersects.length > 0 ) {

            SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );

        }

        return;

    }

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

            plane.position.copy( INTERSECTED.position );
            plane.lookAt( camera.position );
            //INTERSECTED.material.emissive.setHex( 0xff0000 );

        }

        container.style.cursor = 'pointer';

    } else {

        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

        container.style.cursor = 'auto';

    }

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        controls.enabled = false;

        SELECTED = intersects[ 0 ].object;

        var intersects = raycaster.intersectObject( plane );

        if ( intersects.length > 0 ) {

            offset.copy( intersects[ 0 ].point ).sub( plane.position );

        }

        container.style.cursor = 'move';

    }

}

function onDocumentMouseUp( event ) {

    event.preventDefault();

    controls.enabled = true;

    if ( INTERSECTED ) {

        plane.position.copy( INTERSECTED.position );

        SELECTED = null;

    }

    container.style.cursor = 'auto';

}







function animate() {
    render();
    requestAnimationFrame(animate);
    controls.update();
    stats.update();
}

function render() {
    //theta += 0.1;

    // camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
    // camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
    // camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
    //camera.lookAt( scene.position );

    //camera.updateMatrixWorld();

    renderer.render(scene, camera);
}

function threeStart(){
    init();
    initCamera();
    initLoad();
    initObject();
    initLight();
    
    animate();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//显示平面图
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function show_plane(bt){
    document.getElementById("ptxt1").innerHTML="show plane";
    var can = document.getElementById('can');
    var scale=4;

    if(can.style.opacity==0){
        can.style.opacity=1;
        var cans = can.getContext('2d');

        var archi_info=jsonhouse.cemo_scene.archi_info;
        var floor_x=archi_info.sizex, floor_z=archi_info.sizez;
        var max;
        if(floor_x>floor_z) max=floor_x;
        else max=floor_z;
        //scale=Math.ceil(max/600);
        scale=max/600;

        can.width=floor_x/scale;
        can.height=floor_z/scale;

        cans.fillStyle='rgb(240, 240, 240)';//背景色
        cans.fillRect(0, 0, 600, 600);

        var archi_wall=jsonhouse.cemo_scene.archi_scene.archi_wall;
        var archi_window=jsonhouse.cemo_scene.archi_scene.archi_window;                
        var archi_door=jsonhouse.cemo_scene.archi_scene.archi_door;

        cans.beginPath();
        if(archi_wall)
        {//create wall            
            for(var i=0;i<archi_wall.length;i++)
            {
                var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
                for(var j=0; j<aux_polyline.length; j++)
                {
                    if(archi_wall[i].id == aux_polyline[j].id)
                    {
                        //draw wall
                        cans.moveTo(aux_polyline[j].point[0].x/scale, aux_polyline[j].point[0].z/scale);
                        cans.lineTo(aux_polyline[j].point[1].x/scale, aux_polyline[j].point[1].z/scale);
                        break;
                    }
                }
            }        
        }
        cans.lineWidth=3;
        cans.strokeStyle = 'rgb(192, 80, 77)';
        cans.stroke();

        cans.beginPath();
        if(archi_window)
        {//create wall            
            for(var i=0;i<archi_window.length;i++)
            {
                var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
                for(var j=0; j<aux_polyline.length; j++)
                {
                    if(archi_window[i].id == aux_polyline[j].id)
                    {
                        cans.moveTo(aux_polyline[j].point[0].x/scale, aux_polyline[j].point[0].z/scale);
                        cans.lineTo(aux_polyline[j].point[1].x/scale, aux_polyline[j].point[1].z/scale);
                        break;
                    }
                }
            }        
        }
        cans.lineWidth=2;
        cans.strokeStyle = 'rgb(155, 187, 89)';
        cans.stroke();


        cans.beginPath();
        if(archi_door)
        {//create wall            
            for(var i=0;i<archi_door.length;i++)
            {
                var aux_polyline=jsonhouse.cemo_scene.aux_scene.aux_polyline;
                for(var j=0; j<aux_polyline.length; j++)
                {
                    if(archi_door[i].id == aux_polyline[j].id)
                    {
                        cans.moveTo(aux_polyline[j].point[0].x/scale, aux_polyline[j].point[0].z/scale);
                        cans.lineTo(aux_polyline[j].point[1].x/scale, aux_polyline[j].point[1].z/scale);
                        break;
                    }
                }
            }        
        }
        cans.lineWidth=3;
        cans.strokeStyle = 'rgb(128, 100, 162)';
        cans.stroke();

        bt.innerHTML="关闭平面图";    
    }
    else{
        can.style.opacity=0;
        bt.innerHTML="显示平面图";
    }
}

function exportToObj(bt) {
    //document.getElementById("export").innerHTML="hhh";
    var exp=document.getElementById("export");

    if(exp.style.opacity==0){
        var exporter = new THREE.OBJExporter();
        var result = exporter.parse( scene );
        exp.style.opacity=1;
        exp.innerHTML=result.split( '\n' ).join ( '<br />' );     
        bt.innerHTML="关闭显示";  
    }
    else{
        exp.style.opacity=0;
        bt.innerHTML="导出模型";
    }

    // var exporter = new THREE.OBJExporter();
    // var result = exporter.parse( scene );
    // //floatingDiv.style.display = 'block';
    // //floatingDiv.innerHTML = result.split( '\n' ).join ( '<br />' );
    // document.getElementById("export").innerHTML=result.split( '\n' ).join ( '<br />' );
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//材质贴图
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function floor_texture(num){
    document.getElementById("ptxt1").innerHTML="textures";
    
    filename="textures/floor/ground_"+num+".png";
    var texture_floor = new THREE.TextureLoader().load(filename);
    texture_floor.wrapS = THREE.RepeatWrapping;
    texture_floor.wrapT = THREE.RepeatWrapping;
    texture_floor.repeat.set( uvscale_floor, uvscale_floor );

    material_floor.map=texture_floor;
}

function floor_texture_size(i){
    if(i==0){
        if(uvscale_floor>1){
            uvscale_floor-=1;
        }
    }
    else{
        uvscale_floor+=1;
    }
    texture_floor.repeat.set( uvscale_floor, uvscale_floor );
}

function wall_texture(num){
    filename="textures/wall/wall_"+num+".png";

    var texture_wall = new THREE.TextureLoader().load(filename);
    texture_wall.wrapS = THREE.RepeatWrapping;
    texture_wall.wrapT = THREE.RepeatWrapping;
    texture_wall.repeat.set( uvscale_wall, uvscale_wall );

    material_wall.map=texture_wall;
}

function wall_texture_size(i){
    if(i==0){
        if(uvscale_wall>1){
            uvscale_wall-=1;
        }
    }
    else{
        uvscale_wall+=1;
    }
    texture_wall.repeat.set( uvscale_wall, uvscale_wall);
}

function change_color(element){
    var color=document.getElementById("color").value;
    var txt=document.getElementById("ptxt1");
    txt.innerHTML="0x"+color.substring(1);
    txt.style.background=color;

    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

    /*16进制颜色转为RGB格式*/
    var sColor = color.toLowerCase();//转换为小写

    if(sColor && reg.test(sColor))
    {
        if(sColor.length === 4)
        {
            var sColorNew = "#";
            for(var i=1; i<4; i+=1)
            {
                sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));   
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for(var i=1; i<7; i+=2)
        {
            sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));  
        }
        
        //txt.innerHTML=sColorChange.join(",");

        var b=sColorChange.pop();
        var g=sColorChange.pop()
        var r=sColorChange.pop();

        txt.innerHTML=r+", "+g+", "+b;

        if(element==0) material_door.color=new THREE.Color(r/255,g/255,b/255);
        else if(element==1) material_window.color=new THREE.Color(r/255,g/255,b/255);
        else if(element==2){
            txt.innerHTML="background";
            renderer.setClearColor(new THREE.Color(r/255,g/255,b/255));//浅蓝色
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//添加家具
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var array_fur = [];
var fur_num=0;

function get_fur_inner(x, name){
    innertxt='<div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion_fur" href="#collapseFur'+x+'">'+name+'</a></h4></div><div id="collapseFur'+x+
        '" class="panel-collapse collapse in"><div class="panel-body"><div class="panel-body-opera"><p>左右<span class="glyphicon glyphicon-arrow-left" onclick="fur_left_lg('+x+
        ')"></span><span class="glyphicon glyphicon-arrow-right" onclick="fur_right_lg('+x+')"></span><span class="glyphicon glyphicon-chevron-left" onclick="fur_left_sm('+x+
        ')"></span><span class="glyphicon glyphicon-chevron-right" onclick="fur_right_sm('+x+')"></span></p><p>前后<span class="glyphicon glyphicon-arrow-left" onclick="fur_forward_lg('+x+
        ')"></span><span class="glyphicon glyphicon-arrow-right" onclick="fur_back_lg('+x+')"></span><span class="glyphicon glyphicon-chevron-left" onclick="fur_forward_sm('+x+
        ')"></span><span class="glyphicon glyphicon-chevron-right" onclick="fur_back_sm('+x+')"></span></p><p>上下<span class="glyphicon glyphicon-arrow-up" onclick="fur_up_lg('+x+
        ')"></span><span class="glyphicon glyphicon-arrow-down" onclick="fur_down_lg('+x+')"></span><span class="glyphicon glyphicon-chevron-up" onclick="fur_up_sm('+x+
        ')"></span><span class="glyphicon glyphicon-chevron-down" onclick="fur_down_sm('+x+')"></span></p><p>缩放<span class="glyphicon glyphicon-zoom-in" onclick="fur_zoomin_lg('+x+
        ')"></span><span class="glyphicon glyphicon-zoom-out" onclick="fur_zoomout_lg('+x+')"></span><span class="glyphicon glyphicon-plus" onclick="fur_zoomin_sm('+x+
        ')"></span><span class="glyphicon glyphicon-minus" onclick="fur_zoomout_sm('+x+')"></span></p><p>旋转<span class="glyphicon glyphicon-repeat" onclick="fur_rotate_lg('+x+
        ')"></span><span class="glyphicon glyphicon-refresh" onclick="fur_rotate_sm ('+x+')"></span></p></div><button type="button" class="btn btn-default fur-del-bt" onclick="delete_fur('+x+
        ');"><span class="glyphicon glyphicon-trash"></span></button></div></div>';

    return innertxt;
}

function add_furniture(furname, furname_cn){
    var loader = new THREE.JSONLoader();
    var filename="models/common/"+furname+".js";

    loader.load(filename, function ( geometry, materials ) {
        var material = new THREE.MultiMaterial( materials );
        array_fur[fur_num] = new THREE.Mesh( geometry, material );

        objects.push(array_fur[fur_num]);
        curhouse.add( array_fur[fur_num] );            
        fur_num++;
        }
    );

    var newfur = document.createElement("div");  
    newfur.setAttribute("class", "panel panel-default");
    newfur.setAttribute("id", "panel-group"+fur_num);
    newfur.innerHTML=get_fur_inner(fur_num, furname_cn);
    document.getElementById("accordion_fur").appendChild(newfur);
}






function delete_fur(num){
    curhouse.remove(array_fur[num]);

    //从object数据中删除该fur
    for(var i=0; i<objects.length; i++){
        if(objects[i]==array_fur[num]){
            //objects.remove(i);
            objects.splice(i,1);
            break;
        }
    }
    

    var allfur=document.getElementById("accordion_fur");
    for(var i=allfur.childNodes.length-1;i>0;i--){
        if(allfur.childNodes[i].getAttribute("id")=="panel-group"+num){
            allfur.removeChild(allfur.childNodes[i]);
            break;
        }
    }
}


function fur_left_lg(num){
    array_fur[num].position.x -= 150;
}

function fur_left_sm(num){
    array_fur[num].position.x -= 10;
}

function fur_right_lg(num){
    array_fur[num].position.x += 150;
}

function fur_right_sm(num){
    array_fur[num].position.x += 10;
}

function fur_forward_lg(num){
    array_fur[num].position.z += 150;
}

function fur_forward_sm(num){
    array_fur[num].position.z += 10;
}

function fur_back_lg(num){
    array_fur[num].position.z -= 150;
}

function fur_back_sm(num){
    array_fur[num].position.z -= 10;
}

function fur_up_lg(num){
    array_fur[num].position.y += 100;
}

function fur_up_sm(num){
    array_fur[num].position.y += 10;
}

function fur_down_lg(num){
    array_fur[num].position.y -= 100;
}

function fur_down_sm(num){
    array_fur[num].position.y -= 10;
}

function fur_rotate_lg(num){
    array_fur[num].rotation.y += Math.PI/2;
}

function fur_rotate_sm(num){
    array_fur[num].rotation.y += Math.PI/6;
}

function fur_zoomin_lg(num){
    array_fur[num].geometry.scale(1.4, 1.4, 1.4);
}

function fur_zoomout_lg(num){
    array_fur[num].geometry.scale(5/7, 5/7, 5/7);
}

function fur_zoomin_sm(num){
    array_fur[num].geometry.scale(1.05, 1.05, 1.05);
}

function fur_zoomout_sm(num){
    array_fur[num].geometry.scale(20/21, 20/21, 20/21);
}


// function clockwise(){
//     sofa.rotation.y += Math.PI/6;
// }

// function anticlockwise(){
//     sofa.rotation.y -= Math.PI/6;
// }

var mesh_fur;

function create_sample(){
    var loader = new THREE.JSONLoader();

    loader.load('models/floor1_fur4.js', function ( geometry, materials ) {
        var material = new THREE.MultiMaterial( materials );
        //material.side = THREE.DoubleSide;
        mesh_fur = new THREE.Mesh( geometry, material );

        mesh_fur.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.side = THREE.DoubleSide;
            }
        });
        curhouse.add(mesh_fur);
       
        }
    );
}

function create_sample1(){
    // var loader = new THREE.JSONLoader();

    // loader.load('models/whole1.js', function ( geometry, materials ) {
    //     var material = new THREE.MultiMaterial( materials );
    //     material.side = THREE.DoubleSide;
    //     geometry.scale(10,10,10);
    //     var mesh_whole = new THREE.Mesh( geometry, material );

    //     mesh_whole.traverse(function(child) {
    //         if (child instanceof THREE.Mesh) {
    //             child.material.side = THREE.DoubleSide;
    //         }
    //     });
    //     scene.remove(curhouse);
    //     scene.add(mesh_whole);
       
    //     }
    // ); 

    var loader = new THREE.OBJLoader();
    loader.load('models/whole_house.obj', function(obj) {
        //双面绘制
        obj.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                //child.material.side = THREE.DoubleSide;
                child.material = new THREE.MeshLambertMaterial({
                    color: 0x8B4500,
                    side: THREE.DoubleSide
                });
            }
        });

        mesh = obj; //储存到全局变量中
        var objd= new THREE.Object3D();
        objd.add(obj);
        //objd.scale(20,20,20);
        scene.remove(curhouse);
        scene.add(objd);
    });
}

function test(){

    testObj();
    
}
