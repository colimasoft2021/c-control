import axios from "axios";
import { getConnection, querys, sql } from "../database/index";

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
    const { MontoTotal } = req.body
    let result = {};
    try {
        result = await axios.post('http://localhost:3002/api/obtener-configuracion', {
            Clave: "CFB"
        });
    } catch (error) {
        return res.send({mensaje: error.message});
    }
    let multiplo = parseFloat(result.data.mensaje)
    let beneficio = 0;
    beneficio = parseFloat(MontoTotal) * multiplo;
    return res.send({codigo: 01, MontoBeneficio: beneficio});
}

module.exports = {
    obtenerConfiguracion,
    calcularBeneficio
}