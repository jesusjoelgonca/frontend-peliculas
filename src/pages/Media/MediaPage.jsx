import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import Swal from 'sweetalert2';
import * as mediaService from '../../services/mediaService';
import { useCatalogos } from '../../hooks/useCatalogos';

export function MediaPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    generos,
    directores,
    productoras,
    generosActivos,
    directoresActivos,
    productorasActivas,
    tipos,
    loading: catalogosLoading,
  } = useCatalogos();

  const load = () => {
    setLoading(true);
    mediaService
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

  const getNombreGenero = (id) =>
    generos.find((g) => g.id === id)?.nombre ?? id;
  const getNombreDirector = (id) =>
    directores.find((d) => d.id === id)?.nombres ?? id;
  const getNombreProductora = (id) =>
    productoras.find((p) => p.id === id)?.nombre ?? id;
  const getNombreTipo = (id) => tipos.find((t) => t.id === id)?.nombre ?? id;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      serial: form.serial.value.trim(),
      titulo: form.titulo.value.trim(),
      url: form.url.value.trim(),
      sinopsis: form.sinopsis.value.trim() || undefined,
      imagen_portada: form.imagen_portada.value.trim() || undefined,
      anio_estreno: form.anio_estreno.value
        ? Number(form.anio_estreno.value)
        : undefined,
      genero_id: Number(form.genero_id.value),
      director_id: Number(form.director_id.value),
      productora_id: Number(form.productora_id.value),
      tipo_id: Number(form.tipo_id.value),
    };
    startTransition(async () => {
      try {
        if (editing) {
          await mediaService.update(editing.id, payload);
          Swal.fire({ icon: 'success', title: 'Media actualizado' });
        } else {
          await mediaService.create(payload);
          Swal.fire({ icon: 'success', title: 'Media creado' });
        }
        setShowModal(false);
        load();
      } catch {
      }
    });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará "${item.titulo}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await mediaService.remove(item.id);
            Swal.fire({ icon: 'success', title: 'Eliminado' });
            load();
          } catch {
          }
        });
      }
    });
  };

  const listLoading = loading || catalogosLoading;

  return (
    <div>
      <div className="section-hero">
        <div className="section-hero-content">
          <div className="section-hero-icon">
            <i className="bi bi-camera-reels" aria-hidden />
          </div>
          <div className="section-hero-text">
            <h1>Películas y series</h1>
            <p className="section-hero-sub">Catálogo de títulos disponibles</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-app-primary"
          onClick={openCreate}
          disabled={catalogosLoading}
        >
          <i className="bi bi-plus-lg" aria-hidden />
          Añadir título
        </button>
      </div>

      <div className="media-catalog">
        {listLoading && list.length === 0 ? (
          <div className="media-catalog-loading">
            <span className="spinner-dots" aria-hidden><span /><span /><span /></span>
            <span>Cargando catálogo...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="media-catalog-empty">
            <i className="bi bi-film display-4 text-secondary mb-2" aria-hidden />
            <p className="mb-0">No hay títulos. Añade uno con &quot;Añadir título&quot;.</p>
          </div>
        ) : (
          list.map((item) => (
            <article key={item.id} className="media-card">
              <div className="media-card-poster">
                {item.imagen_portada ? (
                  <img
                    src={item.imagen_portada}
                    alt={`Portada de ${item.titulo}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="media-card-placeholder">
                    <i className="bi bi-film" aria-hidden />
                  </div>
                )}
                <div className="media-card-actions-overlay">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light btn-sm"
                      title="Ver enlace"
                    >
                      <i className="bi bi-box-arrow-up-right" aria-hidden />
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => openEdit(item)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item)}
                    disabled={isPending}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="media-card-body">
                <h3 className="media-card-title">{item.titulo}</h3>
                <div className="media-card-meta">
                  {item.anio_estreno != null && (
                    <span className="media-card-year">{item.anio_estreno}</span>
                  )}
                  <div className="media-card-badges">
                    <span className="badge">{getNombreGenero(item.genero_id)}</span>
                    <span className="badge">{getNombreTipo(item.tipo_id)}</span>
                  </div>
                </div>
                <p className="media-card-director">
                  {getNombreDirector(item.director_id)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      {showModal && (
        <div
          className="modal show d-block app-modal-backdrop"
          role="dialog"
          aria-labelledby="modalMediaTitle"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title" id="modalMediaTitle">
                    {editing ? 'Editar media' : 'Nuevo media'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="serial" className="form-label">
                        Serial *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="serial"
                        name="serial"
                        required
                        defaultValue={editing?.serial}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="titulo" className="form-label">
                        Título *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="titulo"
                        name="titulo"
                        required
                        defaultValue={editing?.titulo}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="url" className="form-label">
                      URL *
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="url"
                      name="url"
                      required
                      defaultValue={editing?.url}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sinopsis" className="form-label">
                      Sinopsis
                    </label>
                    <textarea
                      className="form-control"
                      id="sinopsis"
                      name="sinopsis"
                      rows={2}
                      defaultValue={editing?.sinopsis}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="imagen_portada" className="form-label">
                        Imagen de portada (URL)
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="imagen_portada"
                        name="imagen_portada"
                        defaultValue={editing?.imagen_portada}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="anio_estreno" className="form-label">
                        Año de estreno
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="anio_estreno"
                        name="anio_estreno"
                        min="1900"
                        max="2100"
                        defaultValue={editing?.anio_estreno}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="genero_id" className="form-label">
                        Género *
                      </label>
                      <select
                        className="form-select"
                        id="genero_id"
                        name="genero_id"
                        required
                        defaultValue={editing?.genero_id}
                      >
                        <option value="">Seleccione...</option>
                        {generosActivos.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="director_id" className="form-label">
                        Director *
                      </label>
                      <select
                        className="form-select"
                        id="director_id"
                        name="director_id"
                        required
                        defaultValue={editing?.director_id}
                      >
                        <option value="">Seleccione...</option>
                        {directoresActivos.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombres}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="productora_id" className="form-label">
                        Productora *
                      </label>
                      <select
                        className="form-select"
                        id="productora_id"
                        name="productora_id"
                        required
                        defaultValue={editing?.productora_id}
                      >
                        <option value="">Seleccione...</option>
                        {productorasActivas.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="tipo_id" className="form-label">
                        Tipo *
                      </label>
                      <select
                        className="form-select"
                        id="tipo_id"
                        name="tipo_id"
                        required
                        defaultValue={editing?.tipo_id}
                      >
                        <option value="">Seleccione...</option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-app-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-app-primary"
                    disabled={isPending || catalogosLoading}
                  >
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
