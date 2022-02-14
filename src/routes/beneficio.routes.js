import { Router } from "express";
import beneficioController from "../controllers/beneficio.controller";

const router = Router();

router.get('/api/obtener-configuracion', beneficioController.obtenerConfiguracion);
router.post('/api/calcular-beneficio', beneficioController.calcularBeneficio);
router.post('/api/bitacora-beneficio', beneficioController.bitacoraBeneficio);
router.post('/api/acumulacion-componente-central', beneficioController.acumulacionComponenteCentral);

export  default router;