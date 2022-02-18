import { Router } from "express";
import beneficioController from "../controllers/beneficio.controller";
import bitacoraController from "../controllers/bitacora.controller";
import configuracionController from "../controllers/configuracion.controller";

const router = Router();

router.get('/api/obtener-configuracion', configuracionController.obtenerConfiguracion);
router.post('/api/calcular-beneficio', configuracionController.calcularBeneficio);
router.post('/api/bitacora-beneficio', bitacoraController.bitacoraBeneficio);
router.post('/api/acumulacion-componente-central', beneficioController.acumulacionComponenteCentral);

export  default router;