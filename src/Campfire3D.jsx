import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Campfire3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // --- 1. SCÈNE & CAMÉRA ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020305, 0.03);
        scene.background = new THREE.Color(0x010101);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 3, 9);
        camera.lookAt(0, 0.5, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;

        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.innerHTML = '';
            currentMount.appendChild(renderer.domElement);
        }

        // --- 2. ÉCLAIRAGE ---
        const moonLight = new THREE.DirectionalLight(0x8090a0, 1.5);
        moonLight.position.set(10, 20, -15);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(1024, 1024);
        scene.add(moonLight);

        const fireLight = new THREE.PointLight(0xff8822, 5.0, 25);
        fireLight.position.set(0, 1.2, 0);
        fireLight.castShadow = true;
        fireLight.shadow.bias = -0.0005;
        scene.add(fireLight);

        const ambientLight = new THREE.AmbientLight(0x303040, 0.5);
        scene.add(ambientLight);

        // --- 3. DÉCOR (ÎLE & OCÉAN) ---
        const islandGeo = new THREE.PlaneGeometry(18, 18, 128, 128);
        const islandPos = islandGeo.attributes.position;
        for (let i = 0; i < islandPos.count; i++) {
            const x = islandPos.getX(i); const y = islandPos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            let z = dist < 8 ? Math.cos(dist * 0.2) * 1.2 + Math.sin(x * 0.8) * 0.1 + Math.cos(y * 0.7) * 0.1 : -1;
            islandPos.setZ(i, Math.max(-2, z - 0.2));
        }
        islandGeo.computeVertexNormals();
        const sandMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9, metalness: 0.1 });
        const island = new THREE.Mesh(islandGeo, sandMat);
        island.rotation.x = -Math.PI / 2; island.receiveShadow = true;
        scene.add(island);

        const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x051525, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.8 });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2; water.position.y = -0.1; water.receiveShadow = true;
        scene.add(water);

        // --- 4. DÉTAILS (Bois & Palmier) ---
        const logGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x332211, emissive: 0xff4400, emissiveIntensity: 0.3, roughness: 0.9 });
        const firePit = new THREE.Group();
        for (let i = 0; i < 9; i++) {
            const log = new THREE.Mesh(logGeo, logMat);
            log.position.y = 0.15; log.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * 0.5);
            log.position.x = (Math.random() - 0.5) * 0.6; // Tas un peu plus large
            log.position.z = (Math.random() - 0.5) * 0.6;
            log.castShadow = true; firePit.add(log);
        }
        firePit.position.y = 0.7; scene.add(firePit);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 0.8, side: THREE.DoubleSide });
        const createPalm = (x, z, scale) => {
            const group = new THREE.Group();
            const trunkPoints = [];
            for (let i = 0; i < 10; i++) trunkPoints.push(new THREE.Vector3(Math.pow(i / 5, 2) * 0.5 * scale, i * 0.6 * scale, 0));
            const trunkCurve = new THREE.CatmullRomCurve3(trunkPoints);
            const trunkMesh = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 8, 0.15 * scale, 6, false), trunkMat);
            trunkMesh.castShadow = true; group.add(trunkMesh);
            const topPos = trunkPoints[trunkPoints.length - 1];
            for (let i = 0; i < 9; i++) {
                const leafGeo = new THREE.PlaneGeometry(0.6 * scale, 3 * scale);
                const pos = leafGeo.attributes.position;
                for (let v = 0; v < pos.count; v++) pos.setZ(v, Math.pow(pos.getY(v), 2) * -0.15);
                leafGeo.computeVertexNormals();
                const leaf = new THREE.Mesh(leafGeo, leafMat);
                leaf.position.copy(topPos); leaf.rotation.y = (i / 9) * Math.PI * 2; leaf.rotation.x = Math.PI / 3;
                leaf.translateY(1.5 * scale); leaf.castShadow = true; group.add(leaf);
            }
            group.position.set(x, 0.5, z); group.lookAt(0, 0.5, 0); group.rotateY(Math.PI);
            scene.add(group);
        };
        createPalm(3.5, -2, 1.2);

        // --- 5. PARTICULES (FLAMMES LARGES & LENTES) ---
        const pCount = 600; // Plus dense
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pData = new Float32Array(pCount * 2);

        for (let i = 0; i < pCount; i++) {
            // Base plus large pour les flammes
            pPos[i * 3] = (Math.random() - 0.5) * 0.8;
            pPos[i * 3 + 1] = 0;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

            pData[i * 2] = Math.random(); // Life
            const r = Math.random();
            pData[i * 2 + 1] = r < 0.6 ? 0 : (r < 0.8 ? 1 : 2); // Plus de feu (0)
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('data', new THREE.BufferAttribute(pData, 2));

        const pMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
            attribute vec2 data; varying float vLife; varying float vType; uniform float uTime;
            void main() {
                vLife = data.x; vType = data.y;
                vec3 pos = vec3(0.0);
                // Temps ralenti pour le mouvement dans le shader
                float t = uTime * 0.5 + vLife * 10.0; 
                
                if (vType < 0.5) { // FEU (LARGE ET LENT)
                    // Amplitude X/Z augmentée (0.15 -> 0.35)
                    pos.x = position.x + sin(t * 2.0 + vLife * 10.0) * 0.35 * vLife;
                    pos.y = 0.5 + vLife * 1.5; // Hauteur
                    pos.z = position.z + cos(t * 1.5 + vLife * 10.0) * 0.35 * vLife;
                } else if (vType < 1.5) { // FUMÉE
                    pos.x = position.x + sin(t * 0.5) * (0.2 + vLife);
                    pos.y = 0.5 + vLife * 2.0;
                    pos.z = position.z + cos(t * 0.4) * (0.2 + vLife);
                } else { // BRAISES
                    pos.x = position.x + sin(t * 2.0) * (0.1 + vLife);
                    pos.y = 0.5 + vLife * 3.0;
                    pos.z = position.z + cos(t * 1.5) * (0.1 + vLife);
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                float size = 0.0;
                if(vType < 0.5) size = (1.0 - vLife) * 450.0; // Flammes plus grosses
                else if(vType < 1.5) size = vLife * 300.0;
                else size = 30.0;
                
                gl_PointSize = size / -mvPosition.z;
            }
        `,
            fragmentShader: `
            varying float vLife; varying float vType;
            void main() {
                vec2 uv = gl_PointCoord - 0.5; float d = length(uv); if(d > 0.5) discard;
                vec4 col = vec4(0.0); float glow = 1.0 - d*2.0;
                
                if (vType < 0.5) { // FEU
                    col = vec4(1.0, mix(0.1, 0.6, 1.0-vLife), 0.0, (1.0-vLife) * 0.8);
                } else if (vType < 1.5) { // FUMÉE (Discrète)
                    col = vec4(0.1, 0.1, 0.1, vLife * 0.05);
                } else { // BRAISE
                    col = vec4(1.0, 0.5, 0.1, 1.0) * (sin(vLife * 30.0) * 0.5 + 0.5);
                }
                gl_FragColor = col * glow;
            }
        `
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.position.y = 0.2; scene.add(particles);

        // --- 6. ANIMATION ---
        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            const waterPos = waterGeo.attributes.position;
            for (let i = 0; i < waterPos.count; i++) {
                const x = waterPos.getX(i); const y = waterPos.getY(i); const dist = Math.sqrt(x * x + y * y);
                waterPos.setZ(i, Math.sin(dist * 0.5 - time * 0.8) * 0.2 + Math.sin(x * 0.8 + time) * Math.cos(y * 0.9 + time) * 0.1);
            }
            waterGeo.computeVertexNormals(); waterPos.needsUpdate = true;

            fireLight.intensity = 5.0 + Math.sin(time * 8) * 0.5 + Math.cos(time * 20) * 0.3; // Flicker plus lent
            logMat.emissiveIntensity = 0.3 + Math.sin(time * 5) * 0.1;

            pMat.uniforms.uTime.value = time;
            const pData = pGeo.attributes.data.array;
            for (let i = 0; i < pCount; i++) {
                // Vieillissement ralenti (0.005 -> 0.0025)
                pData[i * 2] += 0.0025 * (1 + Math.random());
                if (pData[i * 2] > 1) pData[i * 2] = 0;
            }
            pGeo.attributes.data.needsUpdate = true;

            camera.position.y = 3 + Math.sin(time * 0.2) * 0.1;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount) currentMount.removeChild(renderer.domElement);
            pGeo.dispose(); pMat.dispose(); renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'black' }} />;
};

export default Campfire3D;