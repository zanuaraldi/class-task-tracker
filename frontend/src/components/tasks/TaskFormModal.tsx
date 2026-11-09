import { useState, useEffect, type FormEvent } from 'react';
import type { Task, Class } from '@class-task-tracker/shared';
import { api, ApiError } from '../../services/api';

interface TaskFormModalProps {
  isOpen: boolean;
  taskToEdit: Task | null;
  classes: Class[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function TaskFormModal({
  isOpen,
  taskToEdit,
  classes,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classId, setClassId] = useState<number | ''>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        setDueDate(d.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
      setClassId(taskToEdit.classId);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setClassId(classes.length > 0 ? classes[0].id : '');
    }

    setFieldErrors({});
    setGeneralError('');
  }, [isOpen, taskToEdit, classes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (!title.trim()) {
      setFieldErrors({ title: 'Judul tugas wajib diisi.' });
      return;
    }

    if (!classId) {
      setFieldErrors({ classId: 'Pilih kelas tujuan tugas.' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (taskToEdit) {
        await api.tasks.update(taskToEdit.id, {
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          classId: Number(classId),
        });
      } else {
        await api.tasks.create({
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          classId: Number(classId),
        });
      }

      await onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (typeof err.errors === 'object' && !Array.isArray(err.errors)) {
          setFieldErrors(err.errors as Record<string, string>);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Gagal menyimpan tugas.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{taskToEdit ? 'Ubah Tugas' : 'Tugas Baru'}</h2>
        <p className="muted" style={{ marginBottom: '16px' }}>
          {taskToEdit
            ? 'Perbarui rincian tugas untuk siswa di kelas ini.'
            : 'Buat tugas baru untuk siswa kelas tertentu.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Judul Tugas
            <input
              name="title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Latihan Soal Matematika Bab 2"
              disabled={isSubmitting}
            />
            {fieldErrors.title && <small data-err="title">{fieldErrors.title}</small>}
          </label>

          <label>
            Deskripsi / Instruksi
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan langkah pengerjaan atau format pengumpulan tugas..."
              disabled={isSubmitting}
            />
            {fieldErrors.description && (
              <small data-err="description">{fieldErrors.description}</small>
            )}
          </label>

          <div className="two">
            <label>
              Tenggat Waktu
              <input
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
              />
              {fieldErrors.dueDate && <small data-err="dueDate">{fieldErrors.dueDate}</small>}
            </label>

            <label>
              Kelas Tujuan
              <select
                name="classId"
                value={classId}
                onChange={(e) => setClassId(Number(e.target.value) || '')}
                disabled={isSubmitting}
              >
                {classes.length === 0 ? (
                  <option value="">Memuat daftar kelas...</option>
                ) : (
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))
                )}
              </select>
              {fieldErrors.classId && <small data-err="classId">{fieldErrors.classId}</small>}
            </label>
          </div>

          {generalError && <p className="err" style={{ marginTop: '10px' }}>{generalError}</p>}

          <div className="dlg-f">
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`btn lime ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
