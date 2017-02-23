//创建3D模型
var container, stats;
var camera, controls, scene, renderer;
var initobj, curhouse;
var door_pregeo;

//获取建筑图纸信息
var xmlhttp;
var jsonhouse;

function gethouse(hstr)
{
    xmlhttp=null;
    if (window.XMLHttpRequest) xmlhttp=new XMLHttpRequest(); // code for Firefox, Opera, IE7, etc.
    else if (window.ActiveXObject) xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5

    if (xmlhttp!=null){
        xmlhttp.onreadystatechange=function(){house_info(hstr)};

        var hurl="/info_"+hstr;
        xmlhttp.open("GET",hurl,true);
        xmlhttp.send(null);
    }else{
        alert("Your browser does not support XMLHTTP.");
    }
}
function house_info(hstr)
{
    if (xmlhttp.readyState==4){// 4 = "loaded"
        if (xmlhttp.status==200){// 200 = "OK" 
            jsonhouse=JSON.parse(xmlhttp.responseText);
            showhouse();
            create_house(hstr);
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
function create_house(hstr)
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
    var material1 = new THREE.MeshLambertMaterial({color:0xFFFFFF});//白色
    var mesh_floor = new THREE.Mesh(floor, material1);
    mesh_floor.position.set(0,0,0);
    mesh_floor.rotation.set(-Math.PI/2,0,0);
    curhouse.add(mesh_floor);
    
    var archi_wall=jsonhouse.cemo_scene.archi_scene.archi_wall;
    var archi_window=jsonhouse.cemo_scene.archi_scene.archi_window;                
    var archi_door=jsonhouse.cemo_scene.archi_scene.archi_door;
    var material_wall = new THREE.MeshLambertMaterial({color:0xC1C1C1});//浅灰
    var material_window = new THREE.MeshLambertMaterial({color:0xA1A1A1});//中灰                
    var material_door = new THREE.MeshLambertMaterial({color:0x8B4500});//棕色

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
                    document.getElementById("ptxt1").innerHTML="dx is "+dx+", dy is "+dy+", dz is "+dz;
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
                    document.getElementById("ptxt1").innerHTML+=", width is "+(width+Math.round(thickness))+", height is "+height+", thickness is "+thickness;                       
                    var mesh_wall = new THREE.Mesh(wall,material_wall);

                    mesh_wall.rotateY(-angle);

                    mesh_wall.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall.position.y=Math.round(height/2)+Math.round(altitude);
                    mesh_wall.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;
                    document.getElementById("ptxt1").innerHTML+=", x is "+(mesh_wall.position.x+floor_x/2)+", y is "+mesh_wall.position.y+", z is "+(mesh_wall.position.z+floor_z/2);  

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
                    var win = new THREE.CubeGeometry(width-thickness, height, thickness/2); 
                    var wall_down = new THREE.CubeGeometry(width-thickness, altitude, thickness);
                    var wall_up = new THREE.CubeGeometry(width-thickness, wall_height-altitude-height, thickness);    

                    var mesh_win = new THREE.Mesh(win,material_window);
                    var mesh_wall_down= new THREE.Mesh(wall_down,material_wall);
                    var mesh_wall_up= new THREE.Mesh(wall_up,material_wall);

                    mesh_win.rotateY(-angle);
                    mesh_wall_down.rotateY(-angle);
                    mesh_wall_up.rotateY(-angle);

                    mesh_win.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_win.position.y=Math.round(height/2)+Math.round(altitude);
                    mesh_win.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_down.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_down.position.y=altitude/2;
                    mesh_wall_down.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_wall_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    curhouse.add(mesh_win);
                    curhouse.add(mesh_wall_down);                            
                    curhouse.add(mesh_wall_up);

                    break;
                }
            }
        }        
    }        

    // var loader = new THREE.JSONLoader();

    // loader.load(
    //     // resource URL
    //     'models/door.js',
    //     // Function when resource is loaded
    //     function ( geometry, materials ) {
    //         //var material = new THREE.MeshFaceMaterial({ color: 'red', wireframe: true });
    //         door_geo=geometry;
    //         var object = new THREE.Mesh( geometry, material_door);
    //         curhouse.add( object );

    //         var object1=new THREE.Mesh( geometry, material_door);
    //         object1.position.z=100;
    //         curhouse.add(object1);
    //     }
    // );

    var object = new THREE.Mesh( door_pregeo, material_door );
    object.position.z=0;
    curhouse.add( object );

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
                    var mesh_wall_up= new THREE.Mesh(wall_up,material_wall);

                    mesh_door.rotateY(-angle);
                    mesh_wall_up.rotateY(-angle);

                    mesh_door.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_door.position.y=0;
                    mesh_door.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    mesh_wall_up.position.x=aux_polyline[j].point[0].x/2+aux_polyline[j].point[1].x/2-floor_x/2;
                    mesh_wall_up.position.y=altitude/2+height/2+wall_height/2;
                    mesh_wall_up.position.z=aux_polyline[j].point[0].z/2+aux_polyline[j].point[1].z/2-floor_z/2;

                    curhouse.add(mesh_door);
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
    renderer.setClearColor(0xADD8E6, 1.0);//浅蓝色

    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );//resize侦听器对onWindowResize()函数进行了回调

    stats = new Stats();
    //stats.setMode(1); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById('container').appendChild(stats.domElement);
}

function initCamera(){
    // camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    // camera.position.z = 500;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 600;
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

function initLight(){
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );
}

function initObject(){
    curhouse=new THREE.Object3D();

    var geometry = new THREE.CubeGeometry(200, 100, 50);
    var material = new THREE.MeshLambertMaterial( { color:0xC1C1C1} );
    var mesh = new THREE.Mesh( geometry,material);
    mesh.position.set(0,50,0);
    //scene.add(mesh);
    curhouse.add(mesh);

    //var archi_info=jsonhouse.cemo_scene.archi_info;
    //创建平面，宽，高，宽度分段数，高度分段数
    var floor = new THREE.PlaneGeometry(1600, 1600, 2, 2);
    var material1 = new THREE.MeshLambertMaterial( { color:0xA1A1A1} );
    var mesh_floor = new THREE.Mesh(floor, material1);
    mesh_floor.position.set(0,0,0);
    mesh_floor.rotation.set(-3.14/2,0,0);
    //scene.add(mesh_floor);
    curhouse.add(mesh_floor);

    var loader = new THREE.JSONLoader();

    loader.load(
        // resource URL
        'models/door.js',
        // Function when resource is loaded
        function ( geometry, materials ) {
            //var material = new THREE.MeshFaceMaterial({ color: 'red', wireframe: true });
            door_pregeo=geometry;
            // var object = new THREE.Mesh( geometry, material_door);
            // curhouse.add( object );

            // var object1=new THREE.Mesh( geometry, material_door);
            // object1.position.z=100;
            // curhouse.add(object1);
        }
    );

    scene.add(curhouse);
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
    renderer.render(scene, camera );
}

function threeStart(){
    init();
    initCamera();
    initLight();
    initObject();
    animate();
}

function change_house(s){
    document.getElementById("ptxt1").innerHTML=s;

    // var form = document.getElementById('form1');
    // var myselect = document.getElementById('secret-room');
    // var index=myselect.selectedIndex;
    // var val=myselect.options[index].value;

    // form.action = "room"+val;   //举个例子
    // form.method  = "post";   
    // form.submit();
}