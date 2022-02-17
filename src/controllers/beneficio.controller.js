import axios from "axios";
import { getConnection, querys, sql } from "../database/index";

const obtenerConfiguracion = async(req, res) => {
    res.json('test');
    const pool = await getConnection();
    console.log(pool);
}

const calcularBeneficio = (req, res) => {

}

const bitacoraBeneficio = (req, res) => {

}

const acumulacionComponenteCentral = async(req, res) => {
    const { id_cliente, Monedero, Caja, Cajero, Sucursal, Monto, TipoMovimiento } = req.body;
    let msgProcesoNoTerminado = {CodigoEstatus: "", Mensaje: ""};
    let montoParseado = Monto * 100;
    let idMonedero = desencriptarBase64(Monedero);
    let infoMonedero = await obtenerStatusMonedero(res, idMonedero);
    let statusMonedero = infoMonedero.data.CodigoEstatus;
    let msgMonedero = infoMonedero.data.Mensaje;
    // DETENER PROCESO SI EL CODIGO DE ESTATUS ES DIFERENTE DE 00
    if(statusMonedero !== "00") {
        msgProcesoNoTerminado.CodigoEstatus = statusMonedero;
        msgProcesoNoTerminado.Mensaje = msgMonedero;
        //return res.send(msgProcesoNoTerminado);
    }
    //CONTINUAR PROCESO SI EL CODIGO DE ESTATUS ES 00
    let resMonederoTransDb = await insertarMonederoTransDb(res, id_cliente, TipoMovimiento, Monto, Monedero);
    console.log(resMonederoTransDb);
    let Transaccion = resMonederoTransDb.Transaccion;
    let Id_Trans = resMonederoTransDb.Id_Trans;
    let resMonederoOmniTrans = {};
    let StatusDb = "";
    if(TipoMovimiento === 'I') {
        StatusDb = "ACUMULADO";
        resMonederoOmniTrans = await acumularMonederoOmniTrans(res, idMonedero, Caja, Sucursal, Cajero, Transaccion, montoParseado);
    }else if(TipoMovimiento === 'D') {
        StatusDb = "ACUMULADO";
        resMonederoOmniTrans = await devolverMonederoOmniTrans(res, idMonedero, Caja, Sucursal, Cajero, Transaccion, montoParseado);
    }else if(TipoMovimiento === 'R') {
        StatusDb = "REDIMIDO";
        resMonederoOmniTrans = await redimirMonederoOmniTrans(res, idMonedero, Caja, Sucursal, Cajero, Transaccion);
    }
    let Autorizacion = null;
    let MsgError = null;
    console.log(resMonederoOmniTrans);
    if(!resMonederoOmniTrans.error){
        if(resMonederoOmniTrans.Codigoestatus === '00'){
            Autorizacion = resMonederoOmniTrans.Autorizacion;
        }else {
            StatusDb = "ERROR";
            MsgError = resMonederoOmniTrans.Mensaje;
        }
        let result = actualizarEstatusMonederoTransDb(res, Id_Trans, StatusDb, Autorizacion, MsgError);
        console.log(result);
        
    }
    return res.send(resMonederoOmniTrans);
}

const desencriptarBase64 = (encrypted) => {
    let buff = Buffer.from(encrypted, 'base64');  
    let decoded = buff.toString('utf-8');
    return decoded;
}

const obtenerStatusMonedero = async(res, idMonedero) => {
    console.log('obtenerStatusMonedero');
    try {
        const resultado = await axios.get(`http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans?MonId=${idMonedero}`);
        return resultado; 
    } catch (error) {
        return res.send({error: error.message});
    }
}

const insertarMonederoTransDb = async(res, id_cliente, TipoMovimiento, Monto, Monedero) => {
    console.log("insertarMonederoTransDb");
    let tipoMov = "";
    if(TipoMovimiento === "D" || TipoMovimiento === "I"){
        tipoMov = "ACUMULADO";
    }else{
        tipoMov = "REDIMIDO";
    }
    let fechaHora = new Date();
    let ultimaTransaccion = await obtenerUltimaTransaccionMonedero(Monedero);
    let transaccion = "0001";
    if(ultimaTransaccion.length > 0 || ultimaTransaccion !== undefined) {
        transaccion = parseInt(ultimaTransaccion.Transaccion) + 1;
        transaccion = ("000" + transaccion).slice(-4);
    }
    try {
        const pool = await getConnection();
        await pool
          .request()
          .input("Id_Cliente", sql.VarChar, id_cliente)
          .input("FechaHora", sql.DateTime, fechaHora)
          .input("TipoMov", sql.VarChar, tipoMov)
          .input("Id_Monedero", sql.VarChar, Monedero)
          .input("Monto", sql.Decimal(10, 2), Monto)
          .input("Transaccion", sql.VarChar, transaccion.toString())
          .query(querys.insertMonederoDb);

        const insertado = await pool
          .request()
          .input("Id_Monedero", Monedero)
          .query(querys.obtenerUltimaTransaccion);

        return (insertado.recordset[0]);
    } catch (error) {
        return res.send({error: error.message});
    }
}

const acumularMonederoOmniTrans = async(res, idMonedero, Caja, Sucursal, Cajero, Transaccion, montoParseado) => {
    console.log("acumularMonederoOmniTrans")
    try {
        let result = await axios.put('http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans',{
            Monedero: idMonedero,
            Caja: Caja,
            sucursal: Sucursal,
            Cajero: Cajero,
            Transaccion: Transaccion,
            Monto: montoParseado,
        });
        return result.data;
    } catch (error) {
        console.log(error);
        return ({error: error.message});
    }
    
}

const devolverMonederoOmniTrans =  async(res, idMonedero, Caja, Sucursal, Cajero, Transaccion, montoParseado) => {
    console.log("devolverMonederoOmniTrans");
    try {
        let result = await axios.post('http://10.0.15.80/apiOmnitransGlobal/api/Devolucion',{
            Monedero: idMonedero,
            Caja: Caja,
            sucursal: Sucursal,
            Cajero: Cajero,
            Transaccion: Transaccion,
            Monto: montoParseado,
        });
        return result.data;
    } catch (error) {
        return res.status(405).send({error: error.message});
    }
}

const redimirMonederoOmniTrans =  async(res, idMonedero, Caja, Sucursal, Cajero, Transaccion) => {
    console.log("redimirMonederoOmniTrans");
    try {
        let result = await axios.post('http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans',{
            Monedero: idMonedero,
            Caja: Caja,
            sucursal: Sucursal,
            Cajero: Cajero,
            Transaccion: Transaccion
        });
        return result.data;
    } catch (error) {
        return res.status(405).send({error: error.message});
    }
    
}

const obtenerUltimaTransaccionMonedero = async(Monedero) => {
    try {
        const pool = await getConnection();
    
        const result = await pool
          .request()
          .input("Id_Monedero", Monedero)
          .query(querys.obtenerUltimaTransaccion);
        return result.recordset[0];
    } catch (error) {
        return error.message;
    }
}

const actualizarEstatusMonederoTransDb = async(res, Id_Trans, StatusDb, Autorizacion, MsgError) => {
    console.log("actualizarEstatusMonederoTransDb");
    try {
        const pool = await getConnection();
        const result = await pool.request()
          .input("Id_Trans", sql.Int, Id_Trans)
          .input("Estatus", sql.VarChar, StatusDb)
          .input("Autorizacion", sql.VarChar, Autorizacion)
          .input("Error", sql.VarChar, MsgError)
          .query(querys.actualizarMonederoDb);
       return ({status: 'ok'});
    } catch (error) {
        console.log('erorr');
        return ({error: error.message});
    }
}

module.exports = {
    obtenerConfiguracion,
    calcularBeneficio,
    bitacoraBeneficio,
    acumulacionComponenteCentral
}