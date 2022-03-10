import { Router } from "express";
import beneficioController from "../controllers/beneficio.controller";
import bitacoraController from "../controllers/bitacora.controller";
import configuracionController from "../controllers/configuracion.controller";
import config from "../config";
import basicAuth from "basic-auth";
const router = Router();

var auth = function (req, res, next) {
    var authData = basicAuth(req);
    if (!authData || !authData.name || !authData.pass) {
        res.sendStatus(401).send({error: 'Petición no autorizada'});
        return;
    }
    if (authData.name === config.auth_user && authData.pass === config.auth_password) {
      next();
    } else {
        res.sendStatus(401).send({error: 'Petición no autorizada'});
        return;
    }
  }

router.get('/api/test-connection', configuracionController.testConnection);
router.post('/api/obtener-configuracion', auth, configuracionController.obtenerConfiguracion);
router.post('/api/calcular-beneficio', auth, configuracionController.calcularBeneficio);
router.post('/api/bitacora-beneficio', bitacoraController.bitacoraBeneficio);
router.post('/api/acumulacion-componente-central', beneficioController.acumulacionComponenteCentral);
router.post('/api/actualizar-bitacora-beneficio', bitacoraController.actualizacionBitacoraBeneficio);

export  default router;
