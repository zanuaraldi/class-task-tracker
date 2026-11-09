import { useState, useEffect } from 'react';
import type { StudentCompletionStatus } from '@class-task-tracker/shared';
import { api, ApiError } from '../../services/api';
import { formatDateTime } from '../../utils/date';
import { Icon } from '../ui/Icon';

interface StudentMonitorModalProps {
  taskId: number | null;
  taskTitle: string;
  classNameText?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentMonitorModal({
  taskId,
  taskTitle,
  classNameText,
  isOpen,
  onClose,
}: StudentMonitorModalProps) {
  const [students, setStudents] = useState<StudentCompletionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!isOpen || !taskId) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);
    setSearchFilter('');

    async function loadCompletions() {
      try {
        const data = await api.tasks.getCompletions(taskId!);
        if (mounted) {
          setStudents(data.students);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof ApiError ? err.message : 'Gagal memuat data progres siswa.'
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCompletions();

    return () => {
      mounted = false;
    };
  }, [isOpen, taskId]);

  if (!isOpen || !taskId) return null;

  const totalStudents = students.length;
  const completedStudents = students.filter((s) => s.isCompleted).length;
  const completionPercentage =
    totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Pantau Progres Siswa</h2>
            <p className="muted" style={{ marginTop: '4px' }}>
              {taskTitle} {classNameText ? `· ${classNameText}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="acts"
            onClick={onClose}
            title="Tutup dialog"
            style={{ border: 'none', background: 'none' }}
          >
            <span style={{ fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</span>
          </button>
        </div>

        <div
          style={{
            background: '#f7f8f6',
            border: '1px solid #e7ebe4',
            borderRadius: '16px',
            padding: '14px 18px',
            margin: '16px 0 12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Status Pengumpulan: {completedStudents} dari {totalStudents} siswa selesai
            </span>
            <span className="badge" style={{ fontSize: '12px' }}>
              {completionPercentage}% Selesai
            </span>
          </div>

          <div className="bar" style={{ height: '8px' }}>
            <i style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Cari nama atau email siswa..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              fontSize: '12px',
              borderRadius: '12px',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: '160px', maxHeight: '340px' }}>
          {isLoading ? (
            <div className="state">
              <span className="spin" />
              Memuat data progres siswa...
            </div>
          ) : error ? (
            <div className="state err">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="state">
              {searchFilter
                ? 'Tidak ada siswa yang cocok dengan pencarian.'
                : 'Belum ada siswa terdaftar di kelas ini.'}
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredStudents.map((student) => (
                <li
                  key={student.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: student.isCompleted ? '#f3f8ea' : '#fafafa',
                    border: '1px solid',
                    borderColor: student.isCompleted ? '#d7e7c1' : '#eee',
                  }}
                >
                  <div>
                    <b style={{ fontSize: '13px', display: 'block', color: '#222' }}>
                      {student.name}
                    </b>
                    <span style={{ fontSize: '11px', color: '#777' }}>
                      {student.email}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {student.isCompleted ? (
                      <span className="chip ok" style={{ fontSize: '11px' }}>
                        <Icon name="check" size={12} />
                        Selesai
                      </span>
                    ) : (
                      <span className="chip" style={{ fontSize: '11px', background: '#ececec', color: '#777' }}>
                        Belum Selesai
                      </span>
                    )}

                    {student.isCompleted && student.completedAt && (
                      <small style={{ display: 'block', color: '#7a8075', fontSize: '10px', marginTop: '3px' }}>
                        {formatDateTime(student.completedAt)}
                      </small>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dlg-f" style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
          <button type="button" className="btn ghost" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
