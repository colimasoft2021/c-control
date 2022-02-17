import { Router } from "express";
import beneficioController from "../controllers/beneficio.controller";
import configurationController from "../controllers/configuration.controller"

const router = Router();

router.post('/api/obtener-configuracion', configurationController.obtenerConfiguracion);
router.post('/api/calcular-beneficio', configurationController.calcularBeneficio);
router.post('/api/bitacora-beneficio', beneficioController.bitacoraBeneficio);
router.post('/api/acumulacion-componente-central', beneficioController.acumulacionComponenteCentral);

export  default router;