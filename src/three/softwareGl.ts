import * as THREE from 'three';

let cachedSoftwareGl: boolean | null = null;

/**
 * Detects software WebGL renderers (SwiftShader, llvmpipe, WARP) by probing the
 * GPU renderer string once and immediately releasing the probe context.
 */
export function detectSoftwareGl(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    cachedSoftwareGl = false;
  }
  return cachedSoftwareGl;
}

/**
 * Waits for the software WebGL fence to finish drawing and pauses 80ms before
 * scheduling the next frame so the main thread and DOM remain responsive.
 */
export function afterDraw(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  registerTimer: (id: number) => void,
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext | null;
  if (!gl || typeof gl.fenceSync !== 'function') {
    const id = window.setTimeout(cb, 80);
    registerTimer(id);
    return;
  }

  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();

  const poll = () => {
    if (!sync) {
      const id = window.setTimeout(cb, 80);
      registerTimer(id);
      return;
    }
    const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      const id = window.setTimeout(poll, 5);
      registerTimer(id);
    } else {
      gl.deleteSync(sync);
      const id = window.setTimeout(cb, 80);
      registerTimer(id);
    }
  };

  const id = window.setTimeout(poll, 5);
  registerTimer(id);
}
