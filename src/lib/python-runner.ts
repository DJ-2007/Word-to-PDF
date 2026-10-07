import { spawn } from 'child_process';
import path from 'path';
import { APP_CONFIG } from '@/config';

export interface PythonServiceResponse<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  trace?: string;
}

export async function runPythonService<T = any>(
  action: string,
  params: Record<string, any>,
  timeoutMs: number = APP_CONFIG.conversionTimeoutMs
): Promise<T> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'convert_service.py');

  return new Promise((resolve, reject) => {
    const pythonProc = spawn(APP_CONFIG.pythonPath, [scriptPath], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let stderrData = '';
    let isTimedOut = false;

    const timer = setTimeout(() => {
      isTimedOut = true;
      pythonProc.kill('SIGKILL');
      reject(new Error(`Python conversion process timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pythonProc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    pythonProc.on('close', (code) => {
      clearTimeout(timer);
      if (isTimedOut) return;

      if (!stdoutData.trim()) {
        reject(
          new Error(`Python process exited with code ${code} without output. Stderr: ${stderrData}`)
        );
        return;
      }

      try {
        const response: PythonServiceResponse<T> = JSON.parse(stdoutData.trim());
        if (!response.success) {
          reject(new Error(response.error || 'Unknown error occurred in Python conversion engine.'));
        } else {
          resolve(response.result as T);
        }
      } catch (err: any) {
        reject(
          new Error(
            `Invalid JSON response from Python converter: ${stdoutData.substring(0, 300)}. Stderr: ${stderrData}`
          )
        );
      }
    });

    const payload = JSON.stringify({ action, params });
    pythonProc.stdin.write(payload);
    pythonProc.stdin.end();
  });
}
