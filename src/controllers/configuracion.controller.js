import axios from "axios";
import { getConnection, querys, sql } from "../database/index";
import config from "../config";


const testConnection = async (req, res) => {
  try {
      const pool = await getConnection();
      res.send({mensaje: "conected"});
  } catch (error) {
      res.send({mensaje: error.message})
  }
}

const obtenerConfiguracion = async (req, res) => {
    const { Clave } = req.body
    try {
        const pool = await getConnection();
        const clave = await pool
            .request()
            .input("Clave", Clave)
            .query(querys.obtenerConfiguracion)
        if (clave.recordset.length > 0) {
            res.send({codigo: '02', mensaje: clave.recordset[0].Configuracion});
        } else {
            res.send({codigo: '01', mensaje: 'Clave no existe'});
        }
    } catch (error) {
        res.send({mensaje: error.message})
    }
}

const calcularBeneficio = async (req, res) => {
    const { MontoTotal } = req.body;
    let msgRetorno = {};
    try {
        const configuracion = await axios.post(`http://${config.host}:${config.port}/api/obtener-configuracion`, {
            Clave: "CFB"
        }, {
            auth: {
                username: config.auth_user,
                password: config.auth_password
            }
        });
        if(configuracion.data.mensaje){
            let multiplo = parseFloat(configuracion.data.mensaje)
            let beneficio = 0;
            beneficio = parseFloat(MontoTotal) * multiplo;
            msgRetorno = {codigo: "01", MontoBeneficio: beneficio};
        }else{
            msgRetorno = {codigo: "02", Mensaje: "No existe la clave en la configuración"};
        }
    } catch (error){
        msgRetorno = {error: error.message};
    }
    return res.send(msgRetorno);
}

module.exports = {
    obtenerConfiguracion,
    calcularBeneficio,
    testConnection
}
