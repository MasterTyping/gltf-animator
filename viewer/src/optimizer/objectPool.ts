import * as THREE from "three";

// 풀에 있는 각 객체의 상태를 정의합니다.
interface PoolItem {
  isActive: boolean;
  matrix: THREE.Matrix4;
  // 필요에 따라 color, velocity 등 더 많은 속성을 추가할 수 있습니다.
}

/**
 * InstancedMesh와 함께 사용할 데이터 풀을 관리하는 클래스입니다.
 * 객체의 활성화, 비활성화, 재사용을 효율적으로 처리합니다.
 */
export class ObjectPool {
  private pool: PoolItem[];
  private capacity: number;
  private activeCount = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.pool = Array.from({ length: capacity }, () => ({
      isActive: false,
      matrix: new THREE.Matrix4(), // 각 인스턴스의 위치, 회전, 크기 정보
    }));
  }

  /**
   * 풀에서 비활성화된 객체를 찾아 활성화하고 반환합니다.
   * @returns 활성화된 객체의 인덱스 또는 실패 시 null
   */
  acquire(): number | null {
    if (this.activeCount >= this.capacity) {
      console.warn("ObjectPool: No available objects to acquire.");
      return null;
    }

    const index = this.pool.findIndex((item) => !item.isActive);
    if (index !== -1) {
      this.pool[index].isActive = true;
      this.activeCount++;
      return index;
    }
    return null; // 이론상 이 지점에 도달해서는 안 됨
  }

  /**
   * 특정 인덱스의 객체를 비활성화하여 풀에 반납합니다.
   * @param index 비활성화할 객체의 인덱스
   */
  release(index: number): void {
    if (index >= 0 && index < this.capacity && this.pool[index].isActive) {
      this.pool[index].isActive = false;
      this.pool[index].matrix.identity(); // 매트릭스를 초기화
      this.activeCount--;
    }
  }

  /**
   * 특정 인덱스의 객체 데이터를 가져옵니다.
   * @param index 가져올 객체의 인덱스
   */
  get(index: number): PoolItem | undefined {
    return this.pool[index];
  }

  /**
   * 현재 활성화된 모든 객체의 배열을 반환합니다.
   */
  getActiveObjects(): PoolItem[] {
    return this.pool.filter((item) => item.isActive);
  }

  /**
   * 현재 활성화된 객체의 수를 반환합니다.
   */
  getActiveCount(): number {
    return this.activeCount;
  }
}
