import { useState, useEffect } from 'react';
import * as generosService from '../services/generosService';
import * as directoresService from '../services/directoresService';
import * as productorasService from '../services/productorasService';
import * as tiposService from '../services/tiposService';

export function useCatalogos() {
  const [generos, setGeneros] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [productoras, setProductoras] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      generosService.getAll(),
      directoresService.getAll(),
      productorasService.getAll(),
      tiposService.getAll(),
    ])
      .then(([g, d, p, t]) => {
        if (cancelled) return;
        setGeneros(Array.isArray(g) ? g : []);
        setDirectores(Array.isArray(d) ? d : []);
        setProductoras(Array.isArray(p) ? p : []);
        setTipos(Array.isArray(t) ? t : []);
      })
      .catch(() => {
        if (!cancelled) {
          setGeneros([]);
          setDirectores([]);
          setProductoras([]);
          setTipos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const generosActivos = generos.filter((x) => x.estado === 'Activo');
  const directoresActivos = directores.filter((x) => x.estado === 'Activo');
  const productorasActivas = productoras.filter((x) => x.estado === 'Activo');

  return {
    generos,
    directores,
    productoras,
    tipos,
    generosActivos,
    directoresActivos,
    productorasActivas,
    loading,
  };
}
