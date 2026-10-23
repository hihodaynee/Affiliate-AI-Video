import { useEffect, useRef, useState } from 'react';
import { loadProject, saveProject, type Project } from '../services/projectStorage';

export function useProjectAutosave(project: unknown, restore: (project: Project) => void) {
  const [loading, setLoading] = useState(true);
  const [canSave, setCanSave] = useState(false);
  const [message, setMessage] = useState('');
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    loadProject().then(saved => {
      if (active) {
        if (saved) restoreRef.current(saved);
        setCanSave(true);
      }
    })
      .catch(() => { if (active) setMessage('Không thể khôi phục bản lưu tự động. Bạn vẫn có thể nhập/xuất JSON.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (loading || !canSave) return;
    let active = true;
    const timer = setTimeout(() => {
      queue.current = queue.current.then(() => saveProject(project))
        .then(() => { if (active) setMessage('Đã lưu dự án trên trình duyệt này'); })
        .catch(() => { if (active) setMessage('Chưa lưu được dự án. Hãy xuất JSON để giữ bản sao.'); });
    }, 1000);
    return () => { active = false; clearTimeout(timer); };
  }, [project, loading, canSave]);
  return { loading, message };
}
