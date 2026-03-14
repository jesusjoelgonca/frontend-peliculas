import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import Swal from 'sweetalert2';
import * as productorasService from '../../services/productorasService';

const ESTADOS = ['Activo', 'Inactivo'];

export function ProductorasPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    productorasService.getAll().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      nombre: form.nombre.value.trim(),
      estado: form.estado.value,
      slogan: form.slogan.value.trim() || undefined,
      descripcion: form.descripcion.value.trim() || undefined,
    };
    startTransition(async () => {
      try {
        if (editing) {
          await productorasService.update(editing.id, payload);
          Swal.fire({ icon: 'success', title: 'Productora actualizada' });
        } else {
          await productorasService.create(payload);
          Swal.fire({ icon: 'success', title: 'Productora creada' });
        }
        setShowModal(false);
        load();
      } catch {}
    });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: '¿Eliminar productora?',
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
            await productorasService.remove(item.id);
            Swal.fire({ icon: 'success', title: 'Eliminado' });
            load();
          } catch {}
        });
      }
    });
  };

  return (
    <div>
      <div className="section-hero">
        <div className="section-hero-content">
          <div className="section-hero-icon">
            <i className="bi bi-building" aria-hidden />
          </div>
          <div className="section-hero-text">
            <h1>Productoras</h1>
            <p className="section-hero-sub">Estudios y productoras</p>
          </div>
        </div>
        <button type="button" className="btn btn-app-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg" aria-hidden />
          Nueva productora
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="admin-table-loading">
            <span className="spinner-dots" aria-hidden><span /><span /><span /></span>
            <span>Cargando...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="admin-table-empty">No hay productoras. Añade una con &quot;Nueva productora&quot;.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Slogan</th>
                  <th>Descripción</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="text-muted fw-medium">{item.id}</td>
                    <td className="fw-semibold">{item.nombre}</td>
                    <td>
                      <span className={`badge-estado ${item.estado}`}>{item.estado}</span>
                    </td>
                    <td>{item.slogan ?? '—'}</td>
                    <td>{item.descripcion ?? '—'}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block app-modal-backdrop" role="dialog" aria-labelledby="modalProductoraTitle" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title" id="modalProductoraTitle">{editing ? 'Editar productora' : 'Nueva productora'}</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre *</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" required defaultValue={editing?.nombre} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="estado" className="form-label">Estado</label>
                    <select className="form-select" id="estado" name="estado" defaultValue={editing?.estado ?? 'Activo'}>
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="slogan" className="form-label">Slogan</label>
                    <input type="text" className="form-control" id="slogan" name="slogan" defaultValue={editing?.slogan} />
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
