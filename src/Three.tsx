import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { bodiesAtom, Body, makeDefaultBody } from "./atoms";
import { useEffect, useRef } from "react";
import { PerspectiveCamera as abc, } from "three";
import { CameraControls,  OrbitControls,  PerspectiveCamera, Sky } from "@react-three/drei";

function renderSphere(props:Body) {
    return  (
    <mesh position={props.position}
    >
        <sphereGeometry args={[props.radius, 32, 32]} />
        <meshStandardMaterial color={props.color} />
        {/* <meshToonMaterial  color={props.color} /> */}
    </mesh>
    )
}
let animation=0;
function CameraHandler({position}:{position:[number,number,number]}) {
    
    const camera = new abc(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    return <group position={position}>
        <cameraHelper args={[camera]} />
        
        
    </group>
}
function distanceBetween(a:[number,number,number],b:[number,number,number]) {
    return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
}
function simulateCollision(bodies:Body[]):Body[] {
   let l = bodies.length;
   for (let i = 0; i < l; i++) {
    let m1=bodies[i].mass;
    let v1=bodies[i].velocity;
    let p1=bodies[i].position;
    let r1=bodies[i].radius;
    for (let j=i+1;j<l;j++) {
        let p2=bodies[j].position;
        let n= p1.map((a,i)=>a-p2[i])
        let nMag=Math.sqrt(n[0]**2+n[1]**2+n[2]**2);
        if(distanceBetween(p1,p2)<r1+bodies[j].radius) {
            let m2=bodies[j].mass;
            let v2=bodies[j].velocity;
            let r2=bodies[j].radius;
            let relV=v1.map((a,i)=>a-v2[i])
            let dot=relV[0]*n[0]+relV[1]*n[1]+relV[2]*n[2];
            if(dot<0) {
                let impulse=2*dot/(m1+m2);
                bodies[i].velocity=v1.map((a,i)=>a-impulse*m2*n[i]);
                bodies[j].velocity=v2.map((a,i)=>a+impulse*m1*n[i]);
                console.log(bodies[i].velocity,bodies[j].velocity);
            }
        }


    }
   }
    return bodies;
}
function simulateGravity(bodies:Body[]):Body[] {
    const G=6.67430e-5;
    const dt=1;
    const newBodies:Body[]=bodies.map((body,index)=>{
        let acceleration=[0,0,0];
        bodies.forEach((otherBody,otherIndex)=>{
            if(index!==otherIndex) {
                const distance=distanceBetween(body.position,otherBody.position);
                const force=G*body.mass*otherBody.mass/distance**2;
                const direction=[
                    (otherBody.position[0]-body.position[0])/distance,
                    (otherBody.position[1]-body.position[1])/distance,
                    (otherBody.position[2]-body.position[2])/distance,
                ];
                acceleration=[
                    acceleration[0]+force*direction[0]/body.mass,
                    acceleration[1]+force*direction[1]/body.mass,
                    acceleration[2]+force*direction[2]/body.mass,
                ];
            }
        });
        
        return {...body,velocity:[
            body.velocity[0]+acceleration[0]*dt,
            body.velocity[1]+acceleration[1]*dt,
            body.velocity[2]+acceleration[2]*dt,
        ],position:[
            body.position[0]+body.velocity[0]*dt,
            body.position[1]+body.velocity[1]*dt,
            body.position[2]+body.velocity[2]*dt,
        ]};
    });
    return newBodies;
}

function Three() {
    const [bodies, setBodies] = useAtom(bodiesAtom);
    const cam=useRef(null)
    
    useEffect(() => {
        function moveBodies() {
            setBodies((prev)=>{return simulateGravity(simulateCollision(prev))});
            animation=window.requestAnimationFrame(moveBodies);
        }
       
        setBodies((prev)=>[...prev,makeDefaultBody({position:[2,2,0],color:"#fff"})]);
        animation==window.requestAnimationFrame(moveBodies);
        // setInterval(()=>{window.cancelAnimationFrame(animation)},2000);
        
    }, []);
	return (
		<Canvas  >
            {/* <PerspectiveCamera position={[0,0,10]} makeDefault /> */}
            {
                bodies.length>0 && <OrbitControls target={bodies[0].position} />
            }
            {/* <Sky sunPosition={[1,1, 25]} /> */}
            <axesHelper/>
            <gridHelper/>
			<ambientLight intensity={Math.PI / 2} />
			<spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				decay={0}
				intensity={Math.PI}
			/>
			<pointLight
				position={[-10, -10, -10]}
				decay={0}
				intensity={Math.PI}
			/>
            
           {
                bodies.map((body,index)=>
                renderSphere(body))
           }
           
		</Canvas>
	);
}

export default Three;
