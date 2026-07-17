import { useState, useCallback } from 'react';
import { API_BASE } from '../services/api';

export function useFileDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const download = useCallback(async (path, filename) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cashbook-session-token') || '';
      const headers = {
        ...(token ? { 'X-Session-Token': token } : {})
      };
      
      const response = await fetch(`${API_BASE}${path}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to download file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { download, isLoading, error };
}
