//创建3D模型
var container, stats;
var camera, controls, scene, renderer;
var initobj, curhouse;
var door_pregeo, win_pregeo, win_premat;
var premesh_win, geopre_sofa;
var prewin_width=117, prewin_height=160, prewin_thick=23;
var predoor_width=125, predoor_height=210, predoor_thick=23;
var texture_wall, texture_floor, texture_door, texture_win;
var material_wall, material_floor;
var sofa;

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
            //showhouse();
            create_house();
        }else{
            alert("Problem retrieving data:" + xmlhttp.statusText);
        }
    }
}
function showhouse(){
    var archi_info=jsonhouse.cemo_scene.archi_info;
    var innertxt="size x is : "+archi_info.sizex+", size z is : "+archi_info.sizez+", \n";

    var archi_scene=jsonhouse.cemo_scene.archi_scene;
    //innertxt+="wall num is : "+archi_scene.archi_wall.length+", window num is : "+archi_scene.archi_window.length+", door num is : "+archi_scene.archi_door.length;
    //document.getElementById("ptxt1").innerHTML=innertxt;  
    //document.getElementById("ptxt1").innerHTML=jsonhouse.toString();                
}
function create_house()
{
   // document.getElementById("ptxt1").innerHTML=hstr;

    //清空场景 
    // scene.remove(mesh);
    // scene.remove(mesh_floor);
    scene.remove(curhouse);
    //scene = new THREE.Scene();

    //创建floor1.cemo
    curhouse=new THREE.Object3D();

    var archi_info=jsonhouse.cemo_scene.archi_info;
    var floor_x=archi_info.sizex, floor_z=archi_info.sizez;
    //THREE.PlaneGeometry(width, height, widthSegments, heightSegments) 

    //create floor
    var floor = new THREE.PlaneGeometry(floor_x, floor_z, 2, 2);
    material_floor = new THREE.MeshLambertMaterial({color:0x999999, side: THREE.DoubleSide});//
    var mesh_floor = new THREE.Mesh(floor, material_floor);
    mesh_floor.position.set(0,0,0);
    mesh_floor.rotation.set(-Math.PI/2,0,0);

    //mesh_floor.castShadow=true;
    mesh_floor.receiveShadow=true;
    curhouse.add(mesh_floor);
    
    var archi_wall=jsonhouse.cemo_scene.archi_scene.archi_wall;
    var archi_window=jsonhouse.cemo_scene.archi_scene.archi_window;                
    var archi_door=jsonhouse.cemo_scene.archi_scene.archi_door;
    //var material_wall = new THREE.MeshLambertMaterial({color:0xC1C1C1, side: THREE.DoubleSide});//浅灰
    var material_wall = new THREE.MeshBasicMaterial({map:texture_wall});
    var material_window = new THREE.MeshLambertMaterial({color:0xA1A1A1, side: THREE.DoubleSide});//中灰                
    var material_door = new THREE.MeshLambertMaterial({color:0x8B4500, side: THREE.DoubleSide});//棕色

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
                    //document.getElementById("ptxt1").innerHTML="dx is "+dx+", dy is "+dy+", dz is "+dz;
                    var width=0, angle=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    } 
                    var wall = new THREE.CubeGeometry(width+Math.round(thickness), height, thickness); 
                    //document.getElementById("ptxt1").innerHTML+=", width is "+(width+Math.round(thickness))+", height is "+height+", thickness is "+thickness;                       
                    var mesh_wall = new THREE.Mesh(wall,material_wall);

                    mesh_wall.rotateY(-angle);

                    mesh_wall.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall.position.y=Math.round(height/2)+Math.round(altitude);
                    mesh_wall.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;
                    //document.getElementById("ptxt1").innerHTML+=", x is "+(mesh_wall.position.x+floor_x/2)+", y is "+mesh_wall.position.y+", z is "+(mesh_wall.position.z+floor_z/2);  

                    mesh_wall.castShadow=true;
                    //mesh_wall.receiveShadow=true;
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
                    var width=0, angle=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    } 
                    //var win = new THREE.CubeGeometry(width-thickness, height, thickness/2); 
                    var wall_down = new THREE.CubeGeometry(width-thickness, altitude, thickness);
                    var wall_up = new THREE.CubeGeometry(width-thickness, wall_height-altitude-height, thickness);    

                    var mesh_win=premesh_win.clone();
                    var win_scale=new THREE.Object3D();
                    win_scale.add(mesh_win);
                    win_scale.scale.x=(width-thickness)/prewin_width;

                    var mesh_wall_down= new THREE.Mesh(wall_down,material_wall);
                    var mesh_wall_up= new THREE.Mesh(wall_up,material_wall);

                    //mesh_win.rotateY(-angle);
                    win_scale.rotateY(-angle);
                    mesh_wall_down.rotateY(-angle);
                    mesh_wall_up.rotateY(-angle);

                    // mesh_win.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    // mesh_win.position.y=Math.round(altitude)+1;
                    // mesh_win.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;
                    win_scale.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    win_scale.position.y=Math.round(altitude)+1;
                    win_scale.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_down.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_down.position.y=altitude/2;
                    mesh_wall_down.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_wall_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                   // curhouse.add(mesh_win);
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
                    var width=0, angle=0;

                    if(dy==0){
                        if(dx==0){
                            width=Math.abs(dz);
                            angle=Math.PI/2;
                        } 
                        else if(dz==0){
                            width=Math.abs(dx);
                        }
                        else{
                            width=Math.sqrt(dx*dx+dz*dz);
                            angle=Math.atan(dz/dx);
                        }
                    }
                    else{
                        //y!=0 impossible
                        width=Math.sqrt(dx*dx+dy*dy+dz*dz);
                    } 
                    //var door = new THREE.CubeGeometry(width-thickness, height, thickness/2);
                    var wall_up = new THREE.CubeGeometry(width-thickness, wall_height-altitude-height, thickness); 

                    var mesh_door = new THREE.Mesh(door_pregeo,material_door);
                    var door_scale = new THREE.Object3D();
                    door_scale.add(mesh_door);
                    door_scale.scale.x=width/predoor_width;
                    door_scale.scale.y=height/predoor_height;

                    var mesh_wall_up= new THREE.Mesh(wall_up,material_wall);

                    //mesh_door.rotateY(-angle);
                    door_scale.rotateY(-angle);
                    mesh_wall_up.rotateY(-angle);

                    // mesh_door.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    // mesh_door.position.y=0;
                    // mesh_door.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;
                    door_scale.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    door_scale.position.y=0;
                    door_scale.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_wall_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    //curhouse.add(mesh_door);
                    curhouse.add(door_scale)
                    curhouse.add(mesh_wall_up);


                    break;
                }
            }
        }        
    }


    scene.add(curhouse);
}


//创建3D模型
function init() {
    scene = new THREE.Scene();

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x8ECEE7, 1.0);//浅蓝色
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

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

function initCamera(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 1200;
    camera.position.y = 800;
    camera.position.z = 1200;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 0,
        z : 0
    });

    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);//change侦听器对render()函数进行了回调
}

function left_rotate(){
    curhouse.rotation.y -= Math.PI/6;
}

function right_rotate(){
    curhouse.rotation.y += Math.PI/6;
}

function up_rotate(){
    curhouse.rotation.x -= Math.PI/6;
}

function down_rotate(){
    curhouse.rotation.x += Math.PI/6;
}

function zoom_in(){
    camera.position.x /= 1.5;
    camera.position.y /= 1.5;
    camera.position.z /= 1.5;    
}

function zoom_out(){
    camera.position.x *= 1.5;
    camera.position.y *= 1.5;
    camera.position.z *= 1.5;

}

function front_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 2000;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 100,
        z : 0
    });
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}

function back_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = -2000;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 100,
        z : 0
    });  
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}

function left_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = -2000;
    camera.position.y = 100;
    camera.position.z = 0;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 100,
        z : 0
    });  
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}

function right_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 2000;
    camera.position.y = 100;
    camera.position.z = 0;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 100,
        z : 0
    });  
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}

function top_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 2500;
    camera.position.z = 0;
    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = -1;
    camera.lookAt({
        x : 0,
        y : 0,
        z : 0
    });  
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}

function oblique_view(){
    curhouse.rotation.x=0;
    curhouse.rotation.y=0;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 1200;
    camera.position.y = 1200;
    camera.position.z = 1200;
    camera.up.x = -1;
    camera.up.y = 1;
    camera.up.z = -1;
    camera.lookAt({
        x : 0,
        y : 0,
        z : 0
    });
    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
}


function initLight(){
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    light.target=curhouse;
    light.castShawdow=true;
    scene.add( light );

    light = new THREE.DirectionalLight( 0xA1A1A1 );
    light.position.set( -1, -1, -1 );
    light.castShawdow=true;
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    light.castShawdow=true;
    scene.add( light );

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

function initObject(){
    curhouse=new THREE.Object3D();

    // var geometry = new THREE.CubeGeometry(200, 100, 50);
    // var material = new THREE.MeshLambertMaterial( { color:0xC1C1C1} );
    // var mesh = new THREE.Mesh( geometry,material);
    // mesh.position.set(0,50,0);
    // //scene.add(mesh);
    // curhouse.add(mesh);

    //var archi_info=jsonhouse.cemo_scene.archi_info;
    //创建平面，宽，高，宽度分段数，高度分段数
    var floor = new THREE.PlaneGeometry(1600, 1600, 2, 2);
    var material1 = new THREE.MeshLambertMaterial( { color:0xA1A1A1} );
    var mesh_floor = new THREE.Mesh(floor, material1);
    mesh_floor.position.set(0,0,0);
    mesh_floor.rotation.set(-3.14/2,0,0);
    //scene.add(mesh_floor);
    curhouse.add(mesh_floor);



    var geometry = new THREE.CubeGeometry(150, 150, 150);
    
    texture_wall = new THREE.TextureLoader().load("textures/brick.png" );
    texture_wall.wrapS = THREE.RepeatWrapping;
    texture_wall.wrapT = THREE.RepeatWrapping;
    texture_wall.repeat.set( 2, 2 );

    //texture = new THREE.Texture( canvas);
    var material = new THREE.MeshBasicMaterial({map:texture_wall});
    //texture.needsUpdate = true;
    mesh = new THREE.Mesh( geometry,material );
    curhouse.add( mesh );
    scene.add(curhouse);






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

    // instantiate a loader
    var sofa_loader = new THREE.JSONLoader();

    // load a resource
    sofa_loader.load(
        // resource URL
        'models/sofa.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            //var material = new THREE.MultiMaterial( materials );
            // var material = new THREE.MeshLambertMaterial({color:0xC1C1C1, side: THREE.DoubleSide});
            // geometry.scale(15,15,15);
            // sofa = new THREE.Mesh(geometry,material);
            // curhouse.add(sofa);
            geopre_sofa=geometry;
        }
    );   
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

function animate() {
    render();
    requestAnimationFrame(animate);
    controls.update();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

function threeStart(){
    init();
    initCamera();
    initObject();
    initLight();
    
    animate();
}

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



function floor_texture(num){
    document.getElementById("ptxt1").innerHTML="textures";

    var geometry = new THREE.CubeGeometry(150, 150, 150);
    
    // filename="textures/ground_"+num+".png";
    // texture_floor = new THREE.TextureLoader().load(filename);
    // texture_floor.wrapS = THREE.RepeatWrapping;
    // texture_floor.wrapT = THREE.RepeatWrapping;
    // texture_floor.repeat.set( 2, 2 );

    // material_floor = new THREE.MeshBasicMaterial({map:texture_floor});


    filename="textures/wall_"+num+".png";
    document.getElementById("ptxt1").innerHTML="filename";

    texture_wall = new THREE.TextureLoader().load(filename);
    texture_wall.wrapS = THREE.RepeatWrapping;
    texture_wall.wrapT = THREE.RepeatWrapping;
    texture_wall.repeat.set( 4, 4 );

    material_wall = new THREE.MeshBasicMaterial({map:texture_wall});

    //render();
    create_house();



    //document.getElementById("ptxt1").innerHTML="end";
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//添加家具

var flag=0;

function add_sofa(){
    // instantiate a loader
    document.getElementById("ptxt1").innerHTML="sofa";

    // var material = new THREE.MeshLambertMaterial({color:0xC1C1C1, side: THREE.DoubleSide});
    // if(flag==0){
    //     geopre_sofa.scale(15,15,15);
    //     flag=1;
    // }
    // sofa = new THREE.Mesh(geopre_sofa,material);
    // curhouse.add(sofa);

    var loader = new THREE.JSONLoader();

    // load a resource
    loader.load(
        // resource URL
        'models/sofa.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            var material = new THREE.MultiMaterial( materials );
            var object = new THREE.Mesh( geometry, material );
            curhouse.add( object );
        }
    );


}



var array_fur = new Array(30);
var fur_num=0;

function get_fur_inner(x, name){
    // var innertxt='
    //       <div class="panel panel-default">
    //         <div class="panel-heading">
    //           <h4 class="panel-title">
    //             <a data-toggle="collapse" data-parent="#accordion_fur" 
    //               href="#collapseFur'+x+'">
    //               '+name+'
    //             </a>
    //           </h4>
    //         </div>
    //         <div id="collapseFur'+x+'" class="panel-collapse collapse in">
    //           <div class="panel-body">
    //                 <div class="popover-options">
    //                     <a href="#" type="button" class="btn btn-warning" data-container="body" data-toggle="popover" data-content=\'
    //                         <p>左右
    //                             <span class="glyphicon glyphicon-arrow-left" onclick="fur_left_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-arrow-right" onclick="fur_right_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-left" onclick="fur_left_sm('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-right" onclick="fur_right_sm('+x+')"></span>
    //                         </p>
    //                         <p>前后
    //                             <span class="glyphicon glyphicon-arrow-left" onclick="fur_forward_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-arrow-right" onclick="fur_back_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-left" onclick="fur_forward_sm('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-right" onclick="fur_back_sm('+x+')"></span>
    //                         </p>
    //                         <p>上下
    //                             <span class="glyphicon glyphicon-arrow-up" onclick="fur_up_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-arrow-down" onclick="fur_down_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-up" onclick="fur_up_sm('+x+')"></span>
    //                             <span class="glyphicon glyphicon-chevron-down" onclick="fur_down_sm('+x+')"></span>
    //                         </p>
    //                         <p>缩放
    //                             <span class="glyphicon glyphicon-zoom-in" onclick="fur_zoomin_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-zoom-out" onclick="fur_zoomout_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-plus" onclick="fur_zoomin_sm('+x+')"></span>
    //                             <span class="glyphicon glyphicon-minus" onclick="fur_zoomout_sm('+x+')"></span>
    //                         </p>
    //                         <p>旋转
    //                             <span class="glyphicon glyphicon-repeat" onclick="fur_rotate_lg('+x+')"></span>
    //                             <span class="glyphicon glyphicon-refresh" onclick="fur_rotate_sm ('+x+')"></span>
    //                         </p>
    //                         \'>
    //                         编辑
    //                     </a>
    //                     <button type="button" class="btn btn-default" onclick="delete_fur('+x+');">删除</button>
    //                 </div>
    //           </div>
    //         </div>
    //       </div>
    //     ';

    //var innertxt="str"+x+name;

    // var innertxt="
    //       <div class='panel panel-default'>
    //         <div class='panel-heading'>
    //           <h4 class='panel-title'>
    //             <a data-toggle='collapse' data-parent='#accordion_fur' 
    //               href='#collapseFur"+x+"'>
    //               "+name+"
    //             </a>
    //           </h4>
    //         </div>
    //         <div id='collapseFur"+x+"' class='panel-collapse collapse in'>
    //           <div class='panel-body'>
    //                 <div class='popover-options'>
    //                     <a href='#' type='button' class='btn btn-warning' data-container='body' data-toggle='popover' data-content=\"
    //                         <p>左右
    //                             <span class='glyphicon glyphicon-arrow-left' onclick='fur_left_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-arrow-right' onclick='fur_right_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-left' onclick='fur_left_sm("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-right' onclick='fur_right_sm("+x+")'></span>
    //                         </p>
    //                         <p>前后
    //                             <span class='glyphicon glyphicon-arrow-left' onclick='fur_forward_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-arrow-right' onclick='fur_back_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-left' onclick='fur_forward_sm("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-right' onclick='fur_back_sm("+x+")'></span>
    //                         </p>
    //                         <p>上下
    //                             <span class='glyphicon glyphicon-arrow-up' onclick='fur_up_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-arrow-down' onclick='fur_down_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-up' onclick='fur_up_sm("+x+")'></span>
    //                             <span class='glyphicon glyphicon-chevron-down' onclick='fur_down_sm("+x+")'></span>
    //                         </p>
    //                         <p>缩放
    //                             <span class='glyphicon glyphicon-zoom-in' onclick='fur_zoomin_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-zoom-out' onclick='fur_zoomout_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-plus' onclick='fur_zoomin_sm("+x+")'></span>
    //                             <span class='glyphicon glyphicon-minus' onclick='fur_zoomout_sm("+x+")'></span>
    //                         </p>
    //                         <p>旋转
    //                             <span class='glyphicon glyphicon-repeat' onclick='fur_rotate_lg("+x+")'></span>
    //                             <span class='glyphicon glyphicon-refresh' onclick='fur_rotate_sm ("+x+")'></span>
    //                         </p>
    //                         \">
    //                         编辑
    //                     </a>
    //                     <button type='button' class='btn btn-default' onclick='delete_fur("+x+");'>删除</button>
    //                 </div>
    //           </div>
    //         </div>
    //       </div>
    // ";

    var innertxt="<div class='panel-heading'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#accordion_fur' href='#collapseFur"+x+"'>"+name+"</a></h4></div>";
    innertxt+="<div id='collapseFur"+x+"' class='panel-collapse collapse in'><div class='panel-body'><div class='popover-options'>";
    innertxt+="<a href='#' type='button' class='btn btn-warning' data-container='body' data-toggle='popover' data-content=\"<p>左右";
    innertxt+="<span class='glyphicon glyphicon-arrow-left' onclick='fur_left_lg("+x+")'></span><span class='glyphicon glyphicon-arrow-right' onclick='fur_right_lg("+x+")'></span>";
    innertxt+="<span class='glyphicon glyphicon-chevron-left' onclick='fur_left_sm("+x+")'></span><span class='glyphicon glyphicon-chevron-right' onclick='fur_right_sm("+x+")'></span></p>";
    innertxt+="<p>前后<span class='glyphicon glyphicon-arrow-left' onclick='fur_forward_lg("+x+")'></span><span class='glyphicon glyphicon-arrow-right' onclick='fur_back_lg("+x+")'></span>";
    innertxt+="<span class='glyphicon glyphicon-chevron-left' onclick='fur_forward_sm("+x+")'></span><span class='glyphicon glyphicon-chevron-right' onclick='fur_back_sm("+x+")'></span></p>";
    innertxt+="<p>上下<span class='glyphicon glyphicon-arrow-up' onclick='fur_up_lg("+x+")'></span><span class='glyphicon glyphicon-arrow-down' onclick='fur_down_lg("+x+")'></span>";
    innertxt+="<span class='glyphicon glyphicon-chevron-up' onclick='fur_up_sm("+x+")'></span><span class='glyphicon glyphicon-chevron-down' onclick='fur_down_sm("+x+")'></span></p>";
    innertxt+="<p>缩放<span class='glyphicon glyphicon-zoom-in' onclick='fur_zoomin_lg("+x+")'></span><span class='glyphicon glyphicon-zoom-out' onclick='fur_zoomout_lg("+x+")'></span>";
    innertxt+="<span class='glyphicon glyphicon-plus' onclick='fur_zoomin_sm("+x+")'></span><span class='glyphicon glyphicon-minus' onclick='fur_zoomout_sm("+x+")'></span></p>";
    innertxt+="<p>旋转<span class='glyphicon glyphicon-repeat' onclick='fur_rotate_lg("+x+")'></span><span class='glyphicon glyphicon-refresh' onclick='fur_rotate_sm ("+x+")'></span></p>\">编辑</a>";
    innertxt+="<button type='button' class='btn btn-default' onclick='delete_fur("+x+");'>删除</button></div></div></div>";

    return innertxt;
}

function add_furniture(furname, furname_cn){
    var loader = new THREE.JSONLoader();
    var filename="models/common/"+furname+".js";



    loader.load(filename, function ( geometry, materials ) {
        var material = new THREE.MultiMaterial( materials );
        array_fur[fur_num] = new THREE.Mesh( geometry, material );
        curhouse.add( array_fur[fur_num] );            
        fur_num++;
        }
    );

    var newfur = document.createElement("div");  
    newfur.setAttribute("class", "panel panel-default");
    newfur.innerHTML=get_fur_inner(fur_num, furname_cn);
    document.getElementById("accordion_fur").appendChild(newfur);
}



  // <div class='panel panel-default'>
  //   <div class='panel-heading'>
  //     <h4 class='panel-title'>
  //       <a data-toggle='collapse' data-parent='#accordion_fur' 
  //         href='#collapseFur1'>
  //         样例
  //       </a>
  //     </h4>
  //   </div>
  //   <div id='collapseFur1' class='panel-collapse collapse in'>
  //     <div class='panel-body'>
  //           <div class='popover-options'>
  //               <a href='#' type='button' class='btn btn-warning' data-container='body' data-toggle='popover' data-content="
  //                   <p>左右
  //                       <span class='glyphicon glyphicon-arrow-left' onclick='fur_left_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-arrow-right' onclick='fur_right_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-left' onclick='fur_left_sm(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-right' onclick='fur_right_sm(0)'></span>
  //                   </p>
  //                   <p>前后
  //                       <span class='glyphicon glyphicon-arrow-left' onclick='fur_forward_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-arrow-right' onclick='fur_back_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-left' onclick='fur_forward_sm(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-right' onclick='fur_back_sm(0)'></span>
  //                   </p>
  //                   <p>上下
  //                       <span class='glyphicon glyphicon-arrow-up' onclick='fur_up_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-arrow-down' onclick='fur_down_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-up' onclick='fur_up_sm(0)'></span>
  //                       <span class='glyphicon glyphicon-chevron-down' onclick='fur_down_sm(0)'></span>
  //                   </p>
  //                   <p>缩放
  //                       <span class='glyphicon glyphicon-zoom-in' onclick='fur_zoomin_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-zoom-out' onclick='fur_zoomout_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-plus' onclick='fur_zoomin_sm(0)'></span>
  //                       <span class='glyphicon glyphicon-minus' onclick='fur_zoomout_sm(0)'></span>
  //                   </p>
  //                   <p>旋转
  //                       <span class='glyphicon glyphicon-repeat' onclick='fur_rotate_lg(0)'></span>
  //                       <span class='glyphicon glyphicon-refresh' onclick='fur_rotate_sm (0)'></span>
  //                   </p>
  //                   ">
  //                   编辑
  //               </a>
  //               <button type='button' class='btn btn-default' onclick='delete_fur(0);'>删除</button>
  //           </div>
  //     </div>
  //   </div>
  // </div>
















function delete_fur(num){
    curhouse.remove(array_fur[num]);
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

function delete_sofa(){
    curhouse.remove(sofa);
    document.getElementById("sofa1").style.opacity=0;

}
