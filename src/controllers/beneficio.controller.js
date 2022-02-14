import axios from "axios";
import { getConnection, querys, sql } from "../database/connection";

const obtenerConfiguracion = (req, res) => {
    res.json('test');
}

const calcularBeneficio = (req, res) => {

}

const bitacoraBeneficio = (req, res) => {

}

const acumulacionComponenteCentral = (req, res) => {
    console.log(req.body);
    const {
        id_cliente,
        Monedero,
        Caja,
        Cajero,
        Sucursal,
        Monto,
        TipoMovimiento
    } = req.body;
    let msgProcesoNoTerminado = {CodigoEstatus: "", Mensaje: ""};
    let MonId = desencriptarBase64(Monedero);
    let infoMonedero = obtenerStatusMonedero(MonId);
    let statusMonedero = infoMonedero.CodigoEstatus;
    let msgMonedero = infoMonedero.Mensaje;
    if(statusMonedero !== "00") {
        msgProcesoNoTerminado.CodigoEstatus = CodigoEstatus;
        msgProcesoNoTerminado.Mensaje = msgMonedero;
        res.send(msgProcesoNoTerminado);
    }
    
}

const desencriptarBase64 = (encrypted) => {
    let buff = Buffer.from(encrypted, 'base64');  
    let decoded = buff.toString('utf-8');
    return decoded;
}

const obtenerStatusMonedero = async(monId) => {
    const res = await axios.get(`http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans?MonId=${monId}`);
    console.log(res);
    return res;
}

const insertarMonederoTransDb = async(datos) => {
    let tipoMov = "";
    if(datos.TipoMovimiento === "D" || datos.TipoMovimiento === "I"){
        tipoMov = "ACUMULADO";
    }else{
        tipoMov = "REDIMIDO";
    }
    try {
        const pool = await getConnection();
    
        await pool
          .request()
          .input("Id_cliente", sql.VarChar, idCliente)
          .input("FechaHora", sql.DateTime, fechaHora)
          .input("TipoMov", sql.VarChar, tipoMov)
          .input("Id_Monedero", sql.VarChar, idMonedero)
          .input("Monto", sql.Decimal(10, 2), monto)
          .query(querys.insertMonederoDb);
    
        res.json({ Id_Cliente, FechaHora, TipoMov, Id_monedero, Monto });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
}

const insertarMonederoOmniTrans = () => {

}
module.exports = {
    obtenerConfiguracion,
    calcularBeneficio,
    bitacoraBeneficio,
    acumulacionComponenteCentral
}