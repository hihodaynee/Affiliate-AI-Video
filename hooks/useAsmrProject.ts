import { useEffect, useRef, useState } from 'react';
import { createAsmrProject } from '../types/asmr';
import { loadAsmrProject, saveAsmrProject } from '../services/asmrStorage';

export function useAsmrProject() {
  const [project, setProject] = useState(createAsmrProject);
  const [loading, setLoading] = useState(true);
  const [canSave, setCanSave] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    loadAsmrProject().then(saved => {
      if (!active) return;
      if (saved) setProject(saved);
      setCanSave(true);
    }).catch(() => {
      if (active) setStorageMessage('Chưa khôi phục được bản lưu ASMR. Hãy dùng nhập/xuất JSON để giữ dự án.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (loading || !canSave) return;
    let active = true;
    const timer = setTimeout(() => {
      queue.current = queue.current.then(() => saveAsmrProject(project))
        .then(() => { if (active) setStorageMessage('Đã lưu riêng dự án ASMR trên trình duyệt này.'); })
        .catch(() => { if (active) setStorageMessage('Chưa lưu được ASMR. Hãy xuất JSON để giữ bản sao.'); });
    }, 1000);
    return () => { active = false; clearTimeout(timer); };
  }, [project, loading, canSave]);
  return { project, setProject, loading, storageMessage };
}
