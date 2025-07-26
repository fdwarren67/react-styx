import {useRef, useEffect, useContext, useState, useImperativeHandle, forwardRef} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {MapContext} from "../common-stuff/MapContext.tsx";
import {GeometryUtils} from "../geo-stuff/utils/GeometryUtils.tsx";
import {Polygon, Polyline} from "@arcgis/core/geometry";
import {ModelRoles} from "../geo-stuff/utils/Constants.tsx";
import {MeshUtils} from "../three-stuff/MeshUtils.tsx";
import Graphic from "@arcgis/core/Graphic";
import {Mesh} from "three";

export interface ThreeHandle {
  resize: () => void;
}

const ThreeComponent = forwardRef<ThreeHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    resize: () => { setSizeCounter(sizeCounter + 1)}
  }));

  const ctx = useContext(MapContext);
  const mountRef = useRef<HTMLDivElement>(null);

  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const scene = useRef<THREE.Scene | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const animationId = useRef<number | null>(null);

  const [blockGraphics, setBlockGraphics] = useState<Graphic[]>([]);
  const [wellboreGraphics, setWellboreGraphics] = useState<Graphic[]>([]);
  const [boundaryRing, setBoundaryRing] = useState<number[][]>([[0, 0], [1, 1]]);
  const [scalingFactor, setScalingFactor] = useState<number>(1);
  const [outerRingCenter, setOuterRingCenter] = useState<number[]>([0, 0]);
  const [ctxState, setCtxState] = useState<number>(0);
  const [sizeCounter, setSizeCounter] = useState<number>(0);

  const wellboreMeshes = useRef<Mesh[]>([]);
  const blockMeshes = useRef<Mesh[]>([]);

  ctx.moveListeners.push(async () => {
    setCtxState(ctxState + 1);
  });
  ctx.dragListeners.push(async () => {
    setCtxState(ctxState + 1);
  });

  // graphics layer
  useEffect(() => {
    setBlockGraphics(ctx.graphicsLayer.graphics.filter(g => g.attributes && g.attributes.role === ModelRoles.Block && g.geometry!.type === 'polygon').toArray());
    setWellboreGraphics(ctx.graphicsLayer.graphics.filter(g => g.attributes && g.attributes.role === ModelRoles.Stick).toArray());

    const bounds = ctx.graphicsLayer.graphics.filter(g => g.attributes && g.attributes.role === ModelRoles.Boundary);
    if (bounds.length > 0 && bounds.getItemAt(0)) {
      setBoundaryRing((bounds.getItemAt(0)!.geometry as Polygon).rings[0]);
    }
  }, [ctxState]);

  // boundaryRing
  useEffect(() => {
    const outerRingWidth = GeometryUtils.distance(boundaryRing[0], boundaryRing[1]);
    setScalingFactor(outerRingWidth / 200);

    setOuterRingCenter([
      boundaryRing.map(a => a[0]).reduce((sum: number, val: number) => sum + val, 0) / boundaryRing.length,
      boundaryRing.map(a => a[1]).reduce((sum: number, val: number) => sum + val, 0) / boundaryRing.length
    ]);

    MeshUtils.loadHeightMap(-20, 0x88cc88, mesh => {
      scene.current!.add(mesh);
    });
    MeshUtils.loadHeightMap(-60, 0x8888cc, mesh => {
      scene.current!.add(mesh);
    });
  }, [boundaryRing]);

  // blocks
  useEffect(() => {
    blockMeshes.current.forEach((mesh) => {
      scene.current!.remove(mesh);
      mesh.geometry.dispose();

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    blockMeshes.current.length = 0;

    blockGraphics.forEach((rect, idx) => {
      const ring = (rect.geometry as Polygon).rings[0];
      const walls = MeshUtils.createPolygonWalls(ring, outerRingCenter, scalingFactor);

      walls.forEach(w => {
          w.name = rect.attributes.model.id;
          scene.current!.add(w)

          blockMeshes.current.push(w);
      });
    });
  }, [blockGraphics]);

  // wellbores
  useEffect(() => {
    wellboreMeshes.current.forEach((mesh) => {
      scene.current!.remove(mesh);
      mesh.geometry.dispose();

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    wellboreMeshes.current.length = 0;

    wellboreGraphics.forEach((line, idx) => {
      const path = (line.geometry as Polyline).paths[0];
      const pipe = MeshUtils.createLinePipe(path, outerRingCenter, scalingFactor);
      pipe.name = line.attributes.model.id;

      wellboreMeshes.current.push(pipe);
      scene.current!.add(pipe);
    });
  }, [wellboreGraphics]);

  useEffect(() => {
    if (!mountRef.current || !camera.current || !renderer.current) {
      return;
    }

    const rect = mountRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height - 40;

    renderer.current.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
    console.log('sizeCounter');
  }, [sizeCounter]);

  useEffect(() => {
    if (!mountRef.current || ctx.graphicsLayer.graphics.length === 0) {
      return;
    }

    const currentMount = mountRef.current;

    const rect = mountRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height - 40;

    if (!renderer.current) {
      scene.current = new THREE.Scene();

      camera.current = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      camera.current.position.set(0, 100, 200);
      camera.current.lookAt(0, 0, 0);

      renderer.current = new THREE.WebGLRenderer({ antialias: true });
      renderer.current.setSize(width, height);
      renderer.current.setClearColor(0xffffff);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 100, 100);
      scene.current.add(light);

      const controls = new OrbitControls(camera.current, renderer.current.domElement);
      controls.update();
    }

    camera.current!.aspect = width / height;
    camera.current!.updateProjectionMatrix();

    if (mountRef.current && renderer.current) {
      const animate = () => {
        animationId.current = requestAnimationFrame(animate);
        renderer.current!.render(scene.current!, camera.current!);
      };
      animate();
    }
    mountRef.current.appendChild(renderer!.current.domElement);

    return () => {
      if (currentMount && renderer.current?.domElement) {
        currentMount.removeChild(renderer.current.domElement);
      }
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
      <div ref={mountRef} style={{position: 'absolute', width: '100%', height: '100%'}}></div>
  );
});

export default ThreeComponent;
