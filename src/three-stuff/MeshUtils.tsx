import * as THREE from "three";
import {GeometryUtils} from "../geo-stuff/utils/GeometryUtils.tsx";
import {CylinderGeometry, Mesh, MeshBasicMaterial, PlaneGeometry} from "three";

export class MeshUtils {
  public static createPolygonWalls(ring: number[][], referenceCenter: number[], scalingFactor: number): Mesh<PlaneGeometry, MeshBasicMaterial>[] {
    return ring.map((edge: number[], idx: number, rects: number[][]) => {
      const jdx = (idx + 1) % rects.length;
      const center = [(edge[0] + rects[jdx][0]) / 2, (edge[1] + rects[jdx][1]) / 2];
      const length = GeometryUtils.distance(edge, rects[jdx]) / scalingFactor;
      const rads = GeometryUtils.radians2(edge, rects[jdx]);

      const geometry = new THREE.PlaneGeometry(length, 100, length, 100);

      geometry.rotateY(rads);

      const tx = (center[0] - referenceCenter[0]) / scalingFactor;
      const ty = (center[1] - referenceCenter[1]) / scalingFactor;

      geometry.translate(tx, 0, -ty);

      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: .05
      });

      return new THREE.Mesh(geometry, material);
    });
  }

  public static createLinePipe(path: number[][], referenceCenter: number[], scalingFactor: number): Mesh<CylinderGeometry, MeshBasicMaterial> {
    const center = [(path[0][0] + path[1][0]) / 2, (path[0][1] + path[1][1]) / 2];
    const length = GeometryUtils.distance(path[0], path[1]) / scalingFactor;
    const rads = GeometryUtils.radians2(path[0], path[1]);

    const geometry = new THREE.CylinderGeometry(1, 1, length, 8);
    geometry.rotateZ(Math.PI / 2);
    geometry.rotateY(rads);

    const tx = (center[0] - referenceCenter[0]) / scalingFactor;
    const ty = (center[1] - referenceCenter[1]) / scalingFactor;

    geometry.translate(tx, 0, -ty);

    const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .6  });

    return new THREE.Mesh(geometry, material);
  }

  public static loadHeightMap(ht: number, color: number, callback: (mesh: Mesh<PlaneGeometry,MeshBasicMaterial>) => void): void {
    const loader = new THREE.TextureLoader();
    loader.load(import.meta.env.BASE_URL + 'heightmap.png', (texture) => {
      const img = texture.image as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const cc = canvas.getContext('2d')!;
      cc.drawImage(img, 0, 0);
      const data = cc.getImageData(0, 0, img.width, img.height).data;

      const geometry = new THREE.PlaneGeometry(200, 200, img.width - 1, img.height - 1);
      geometry.rotateX(-Math.PI / 2);

      const vertices = geometry.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const grayscale = data[i * 4];
        const height = (grayscale / 255) * 50 + ht;
        vertices.setY(i, height);
      }
      vertices.needsUpdate = true;
      geometry.computeVertexNormals();

      const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: .05 });

      callback(new THREE.Mesh(geometry, material));
    });
  }
}
