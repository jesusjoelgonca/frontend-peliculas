import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import Swal from 'sweetalert2';
import * as generosService from '../../services/generosService';

const ESTADOS = ['Activo', 'Inactivo'];

function descripcionRedundante(nombre, descripcion) {
  if (!descripcion || !descripcion.trim()) return true;
  const n = nombre.trim().toLowerCase();
  const d = descripcion.trim().toLowerCase();
  if (d === n) return true;
  if (d === `género: ${n}` || d === `género ${n}`) return true;
  if (d.startsWith('género: ') && d.slice(8).trim() === n) return true;
  if (d.startsWith('género ') && d.slice(7).trim() === n) return true;
  return false;
}

export function GenerosPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    generosService
      .getAll()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      nombre: form.nombre.value.trim(),
      estado: form.estado.value,
      descripcion: form.descripcion.value.trim() || undefined,
    };
    startTransition(async () => {
      try {
        if (editing) {
          await generosService.update(editing.id, payload);
          Swal.fire({ icon: 'success', title: 'Género actualizado' });
        } else {
          await generosService.create(payload);
          Swal.fire({ icon: 'success', title: 'Género creado' });
        }
        setShowModal(false);
        load();
      } catch {
      }
    });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: '¿Eliminar género?',
      text: `Se eliminará "${item.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await generosService.remove(item.id);
            Swal.fire({ icon: 'success', title: 'Eliminado' });
            load();
          } catch {
          }
        });
      }
    });
  };

  return (
    <div>
      <div className="section-hero">
        <div className="section-hero-content">
          <div className="section-hero-icon">
            <i className="bi bi-tags" aria-hidden />
          </div>
          <div className="section-hero-text">
            <h1>Géneros</h1>
            <p className="section-hero-sub">Clasificación de películas y series</p>
          </div>
        </div>
        <button type="button" className="btn btn-app-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg" aria-hidden />
          Nuevo género
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="admin-table-loading">
            <span className="spinner-dots" aria-hidden><span /><span /><span /></span>
            <span>Cargando...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="admin-table-empty">
            No hay géneros. Añade uno con &quot;Nuevo género&quot;.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => {
                  const tieneDescripcion = item.descripcion?.trim() && !descripcionRedundante(item.nombre, item.descripcion);
                  return (
                    <tr key={item.id}>
                      <td className="text-muted fw-medium">{item.id}</td>
                      <td className="fw-semibold">{item.nombre}</td>
                      <td>{tieneDescripcion ? item.descripcion.trim() : '—'}</td>
                      <td>
                        <span className={`badge-estado ${item.estado}`}>{item.estado}</span>
                      </td>
                      <td className="text-end">
                        <div className="table-actions">
                          <button type="button" className="btn btn-app-outline" onClick={() => openEdit(item)}>
                            <i className="bi bi-pencil" aria-hidden /> Editar
                          </button>
                          <button type="button" className="btn btn-app-danger" onClick={() => handleDelete(item)} disabled={isPending}>
                            <i className="bi bi-trash" aria-hidden /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal show d-block app-modal-backdrop"
          role="dialog"
          aria-labelledby="modalGeneroTitle"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title" id="modalGeneroTitle">
                    {editing ? 'Editar género' : 'Nuevo género'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre *</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" required defaultValue={editing?.nombre} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="estado" className="form-label">Estado</label>
                    <select className="form-select" id="estado" name="estado" defaultValue={editing?.estado ?? 'Activo'}>
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" rows={2} defaultValue={editing?.descripcion} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-app-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-app-primary" disabled={isPending}>
                    {isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
